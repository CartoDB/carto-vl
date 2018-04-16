import * as R from '../core/renderer';
import * as rsys from './rsys';
import Dataframe from '../core/dataframe';
import * as Protobuf from 'pbf';
import * as LRU from 'lru-cache';
import * as windshaftFiltering from './windshaft-filtering';
import { VectorTile } from '@mapbox/vector-tile';
import Metadata from '../core/metadata';

const SAMPLE_ROWS = 1000;
const MIN_FILTERING = 2000000;

// Get dataframes <- MVT <- Windshaft
// Get metadata
// Instantiate map Windshaft
// Requrest SQL API (temp)
// Cache dataframe



export default class Windshaft {

    constructor(source) {
        this._source = source;

        this._exclusive = true;

        this._requestGroupID = 0;
        this._oldDataframes = [];
        this._MNS = null;
        this._promiseMNS = null;
        this._categoryStringToIDMap = {};
        this._numCategories = 0;
        const lruOptions = {
            max: 1000
            // TODO improve cache length heuristic
            , length: function () { return 1; }
            , dispose: (key, promise) => {
                promise.then(dataframe => {
                    if (!dataframe.empty) {
                        dataframe.free();
                        this._removeDataframe(dataframe);
                    }
                });
            }
            , maxAge: 1000 * 60 * 60
        };
        this.cache = LRU(lruOptions);
        this.inProgressInstantiations = {};
    }

    _bindLayer(addDataframe, removeDataframe, dataLoadedCallback) {
        this._addDataframe = addDataframe;
        this._removeDataframe = removeDataframe;
        this._dataLoadedCallback = dataLoadedCallback;
    }

    _getInstantiationID(MNS, resolution, filtering) {
        return JSON.stringify({
            MNS,
            resolution,
            filtering: this.metadata && this.metadata.featureCount > MIN_FILTERING ? filtering : null
        });
    }

    /**
     * Should be called whenever the style changes (even if metadata is not going to be used)
     * This not only computes metadata: it also updates the map (instantiates) for the new style if needed
     * Returns  a promise to a Metadata
     * @param {*} style
     */
    async getMetadata(style) {
        const MNS = style.getMinimumNeededSchema();
        const resolution = style.getResolution();
        const filtering = windshaftFiltering.getFiltering(style, { exclusive: this._exclusive });
        // Force to include `cartodb_id` in the MNS columns.
        // TODO: revisit this request to Maps API
        if (!MNS.columns.includes('cartodb_id')) {
            MNS.columns.push('cartodb_id');
        }
        if (this._needToInstantiate(MNS, resolution, filtering)) {
            const instantiationData = await this._instantiate(MNS, resolution, filtering);
            this._updateStateAfterInstantiating(instantiationData);
        }
        return this.metadata;
    }

    /**
     * After calling getMetadata(), data for a viewport can be obtained with this function.
     * So long as the style doesn't change, getData() can be called repeatedly for different
     * viewports. If style changes getMetadata() should be called before requesting data
     * for the new style.
     * @param {*} viewport
     */
    getData(viewport) {
        if (this._isInstantiated()) {
            const tiles = rsys.rTiles(viewport);
            this._getTiles(tiles);
        }
    }


    _getTiles(tiles) {
        this._requestGroupID++;
        var completedTiles = [];
        var needToComplete = tiles.length;
        const requestGroupID = this._requestGroupID;
        tiles.forEach(t => {
            const { x, y, z } = t;
            this.getDataframe(x, y, z).then(dataframe => {
                if (dataframe.empty) {
                    needToComplete--;
                } else {
                    completedTiles.push(dataframe);
                }
                if (completedTiles.length == needToComplete && requestGroupID == this._requestGroupID) {
                    this._oldDataframes.map(d => d.active = false);
                    completedTiles.map(d => d.active = true);
                    this._oldDataframes = completedTiles;
                    this._dataLoadedCallback();
                }
            });
        });
    }

    /**
     * Check if the map needs to be reinstantiated
     * This happens:
     *  - When the minimun required schema changed.
     *  - When the resolution changed.
     *  - When the filter conditions changed and the dataset should be server-filtered.
     */
    _needToInstantiate(MNS, resolution, filtering) {
        return !R.schema.equals(this._MNS, MNS) || resolution != this.resolution || (JSON.stringify(filtering) != JSON.stringify(this.filtering) && this.metadata.featureCount > MIN_FILTERING);
    }

    _isInstantiated() {
        return !!this.metadata;
    }

    _getCategoryIDFromString(category, readonly = true) {
        if (category === undefined) {
            category = 'null';
        }
        if (this._categoryStringToIDMap[category] !== undefined) {
            return this._categoryStringToIDMap[category];
        }
        if (readonly) {
            console.warn(`category ${category} not present in metadata`);
            return -1;
        }
        this._categoryStringToIDMap[category] = this._numCategories;
        this._numCategories++;
        return this._categoryStringToIDMap[category];
    }


    async _instantiateUncached(MNS, resolution, filters) {
        const conf = this._getConfig();
        const agg = await this._generateAggregation(MNS, resolution);
        let select = this._buildSelectClause(MNS);
        let aggSQL = this._buildQuery(select);

        const query = `(${aggSQL}) AS tmp`;
        const metadata = await this._getMetadata(query, MNS, conf);

        select = this._buildSelectClause(MNS, metadata.columns.filter(c => c.type == 'date').map(c => c.name));
        aggSQL = this._buildQuery(select);

        // If the number of features is higher than the minimun, enable server filtering.
        let backendFilters = metadata.featureCount > MIN_FILTERING ? filters : null;

        if (backendFilters && this._requiresAggregation(MNS)) {
            agg.filters = windshaftFiltering.getAggregationFilters(backendFilters);
            if (!this._exclusive) {
                backendFilters = null;
            }
        }
        if (backendFilters) {
            aggSQL = this._buildQuery(select, backendFilters);
        }

        const urlTemplate = await this._getUrlPromise(query, conf, agg, aggSQL);

        return { MNS, resolution, filters, metadata, urlTemplate };
    }

    _updateStateAfterInstantiating({MNS, resolution, filters, metadata, urlTemplate}) {
        this._checkLayerMeta(MNS);
        this._oldDataframes = [];
        this.cache.reset();
        this.urlTemplate = urlTemplate;
        this.metadata = metadata;
        this._MNS = MNS;
        this.filtering = filters;
        this.resolution = resolution;
    }

    async _instantiate(MNS, resolution, filters) {
        if (this.inProgressInstantiations[this._getInstantiationID(MNS, resolution, filters)]) {
            return this.inProgressInstantiations[this._getInstantiationID(MNS, resolution, filters)];
        }
        const instantiationPromise = this._instantiateUncached(MNS, resolution, filters);
        this.inProgressInstantiations[this._getInstantiationID(MNS, resolution, filters)] = instantiationPromise;
        return instantiationPromise;
    }

    _checkLayerMeta(MNS) {
        if (!this._isAggregated()) {
            if (this._requiresAggregation(MNS)) {
                throw new Error('Aggregation not supported for this dataset');
            }
        }
    }

    _isAggregated() {
        return this._layerMeta ? this._layerMeta.aggregation.mvt : false;
    }

    _requiresAggregation(MNS) {
        return MNS.columns.some(column => R.schema.column.isAggregated(column));
    }

    _generateAggregation(MRS, resolution) {
        let aggregation = {
            columns: {},
            dimensions: {},
            placement: 'centroid',
            resolution: resolution,
            threshold: 1,
        };

        MRS.columns
            .forEach(name => {
                if (name !== 'cartodb_id') {
                    if (R.schema.column.isAggregated(name)) {
                        aggregation.columns[name] = {
                            aggregate_function: R.schema.column.getAggFN(name),
                            aggregated_column: R.schema.column.getBase(name)
                        };
                    } else {
                        aggregation.dimensions[name] = name;
                    }
                }
            });

        return aggregation;
    }

    _buildSelectClause(MRS, dateFields = []) {
        return MRS.columns.map(name => R.schema.column.getBase(name)).map(
            name => dateFields.includes(name) ? name + '::text' : name
        )
            .concat(['the_geom', 'the_geom_webmercator', 'cartodb_id']);
    }

    _buildQuery(select, filters) {
        const columns = select.filter((item, pos) => select.indexOf(item) == pos).join();
        const relation = this._source._query ? `(${this._source._query}) as _cdb_query_wrapper` : this._source._tableName;
        const condition = filters ? windshaftFiltering.getSQLWhere(filters) : '';
        return `SELECT ${columns} FROM ${relation} ${condition}`;
    }

    _getConfig() {
        // for local environments, which require direct access to Maps and SQL API ports, end the configured URL with "{local}"
        return {
            apiKey: this._source._apiKey,
            username: this._source._username,
            mapsServerURL: this._source._serverURL.maps,
            sqlServerURL: this._source._serverURL.sql
        };
    }

    free() {
        this.cache.reset();
        this._oldDataframes = [];
    }

    _generateDataFrame(rs, geometry, properties, size, type) {
        const dataframe = new Dataframe({
            active: false,
            center: rs.center,
            geom: geometry,
            properties: properties,
            scale: rs.scale,
            size: size,
            type: type,
            metadata: this.metadata,
        });

        return dataframe;
    }

    async _getUrlPromise(query, conf, agg, aggSQL) {
        const LAYER_INDEX = 0;
        this.geomType = await this.getGeometryType(query, conf);

        if (this.geomType != 'point') {
            agg = false;
        }

        const mapConfigAgg = {
            buffersize: {
                'mvt': 0
            },
            layers: [
                {
                    type: 'mapnik',
                    options: {
                        sql: aggSQL,
                        aggregation: agg
                    }
                }
            ]
        };
        const response = await fetch(endpoint(conf), this._getRequestConfig(mapConfigAgg));
        const layergroup = await response.json();
        this._layerMeta = layergroup.metadata.layers[0].meta;
        this._subdomains = layergroup.cdn_url ? layergroup.cdn_url.templates.https.subdomains : [];
        return getLayerUrl(layergroup, LAYER_INDEX, conf);
    }

    _getRequestConfig(mapConfigAgg) {
        return {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mapConfigAgg),
        };
    }

    getDataframe(x, y, z) {
        const id = `${x},${y},${z}`;
        const c = this.cache.get(id);
        if (c) {
            return c;
        }
        const promise = this.requestDataframe(x, y, z);
        this.cache.set(id, promise);
        return promise;
    }

    requestDataframe(x, y, z) {
        const mvt_extent = 4096;

        return fetch(this._getTileUrl(x, y, z))
            .then(rawData => rawData.arrayBuffer())
            .then(response => {

                if (response.byteLength == 0 || response == 'null') {
                    return { empty: true };
                }
                var tile = new VectorTile(new Protobuf(response));
                const mvtLayer = tile.layers[Object.keys(tile.layers)[0]];
                var fieldMap = {};

                const numFields = [];
                const catFields = [];
                const dateFields = [];
                this._MNS.columns.map(name => {
                    const basename = R.schema.column.getBase(name);
                    const type = this.metadata.columns.find(c => c.name == basename).type;
                    if (type == 'category') {
                        catFields.push(name);
                    } else if (type == 'float') {
                        numFields.push(name);
                    } else if (type == 'date') {
                        dateFields.push(name);
                    } else {
                        throw new Error(`Column type '${type}' not supported`);
                    }

                });
                catFields.map((name, i) => fieldMap[name] = i);
                numFields.map((name, i) => fieldMap[name] = i + catFields.length);
                dateFields.map((name, i) => fieldMap[name] = i + catFields.length + numFields.length);

                const { points, featureGeometries, properties } = this._decodeMVTLayer(mvtLayer, this.metadata, mvt_extent, catFields, numFields, dateFields);

                var rs = rsys.getRsysFromTile(x, y, z);
                let dataframeProperties = {};
                Object.keys(fieldMap).map((name, pid) => {
                    dataframeProperties[name] = properties[pid];
                });
                let dataFrameGeometry = this.geomType == 'point' ? points : featureGeometries;
                const dataframe = this._generateDataFrame(rs, dataFrameGeometry, dataframeProperties, mvtLayer.length, this.geomType);
                this._addDataframe(dataframe);
                return dataframe;
            });
    }

    _getTileUrl(x, y, z) {
        return this.urlTemplate.replace('{x}', x).replace('{y}', y).replace('{z}', z).replace('{s}', this._getSubdomain(x, y));
    }

    _getSubdomain(x, y) {
        // Reference https://github.com/Leaflet/Leaflet/blob/v1.3.1/src/layer/tile/TileLayer.js#L214-L217
        return this._subdomains[Math.abs(x + y) % this._subdomains.length];
    }

    _decodePolygons(geom, featureGeometries, mvt_extent) {
        let polygon = null;
        let geometry = [];
        /*
            All this clockwise non-sense is needed because the MVT decoder dont decode the MVT fully.
            It doesn't distinguish between internal polygon rings (which defines holes) or external ones, which defines more polygons (mulipolygons)
            See:
                https://github.com/mapbox/vector-tile-spec/tree/master/2.1
                https://en.wikipedia.org/wiki/Shoelace_formula
        */
        for (let j = 0; j < geom.length; j++) {
            //if exterior
            //   push current polygon & set new empty
            //else=> add index to holes
            if (isClockWise(geom[j])) {
                if (polygon) {
                    geometry.push(polygon);
                }
                polygon = {
                    flat: [],
                    holes: []
                };
            } else {
                if (j == 0) {
                    throw new Error('Invalid MVT tile: first polygon ring MUST be external');
                }
                polygon.holes.push(polygon.flat.length / 2);
            }
            for (let k = 0; k < geom[j].length; k++) {
                polygon.flat.push(2 * geom[j][k].x / mvt_extent - 1.);
                polygon.flat.push(2 * (1. - geom[j][k].y / mvt_extent) - 1.);
            }
        }
        //if current polygon is not empty=> push it
        if (polygon && polygon.flat.length > 0) {
            geometry.push(polygon);
        }
        featureGeometries.push(geometry);
    }

    _decodeLines(geom, featureGeometries, mvt_extent) {
        let geometry = [];
        geom.map(l => {
            let line = [];
            l.map(point => {
                line.push(2 * point.x / mvt_extent - 1, 2 * (1 - point.y / mvt_extent) - 1);
            });
            geometry.push(line);
        });
        featureGeometries.push(geometry);
    }

    _decodeMVTLayer(mvtLayer, metadata, mvt_extent, catFields, numFields, dateFields) {
        const properties = [];
        for (let i = 0; i < catFields.length + numFields.length + dateFields.length; i++) {
            properties.push(new Float32Array(mvtLayer.length + 1024));
        }
        if (this.geomType == 'point') {
            var points = new Float32Array(mvtLayer.length * 2);
        }
        let featureGeometries = [];
        for (var i = 0; i < mvtLayer.length; i++) {
            const f = mvtLayer.feature(i);
            const geom = f.loadGeometry();
            if (this.geomType == 'point') {
                points[2 * i + 0] = 2 * (geom[0][0].x) / mvt_extent - 1.;
                points[2 * i + 1] = 2 * (1. - (geom[0][0].y) / mvt_extent) - 1.;
            } else if (this.geomType == 'polygon') {
                this._decodePolygons(geom, featureGeometries, mvt_extent);
            } else if (this.geomType == 'line') {
                this._decodeLines(geom, featureGeometries, mvt_extent);
            } else {
                throw new Error(`Unimplemented geometry type: '${this.geomType}'`);
            }

            catFields.map((name, index) => {
                properties[index][i] = this._getCategoryIDFromString(f.properties[name]);
            });
            numFields.map((name, index) => {
                properties[index + catFields.length][i] = Number(f.properties[name]);
            });
            dateFields.map((name, index) => {
                const d = Date.parse(f.properties[name]);
                if (Number.isNaN(d)) {
                    throw new Error('invalid MVT date');
                }
                const metadataColumn = metadata.columns.find(c => c.name == name);
                const min = metadataColumn.min;
                const max = metadataColumn.max;
                const n = (d - min) / (max.getTime() - min.getTime());
                properties[index + catFields.length + numFields.length][i] = n;
            });
        }

        return { properties, points, featureGeometries };
    }

    async _getMetadata(query, proto, conf) {
        //Get column names and types with a limit 0
        //Get min,max,sum and count of numerics
        //for each category type
        //Get category names and counts by grouping by
        //Assign ids

        const [{ numerics, categories, dates }, featureCount] = await Promise.all([
            this._getColumnTypes(query, conf),
            this.getFeatureCount(query, conf)]);

        const sampling = Math.min(SAMPLE_ROWS / featureCount, 1);

        const [sample, numericsTypes, datesTypes, categoriesTypes] = await Promise.all([
            this.getSample(conf, sampling),
            this.getNumericTypes(numerics, query, conf),
            this.getDatesTypes(dates, query, conf),
            this.getCategoryTypes(categories, query, conf)]);

        let columns = [];
        numerics.forEach((name, index) => columns.push(numericsTypes[index]));
        dates.forEach((name, index) => columns.push(datesTypes[index]));

        const categoryIDs = {};
        categories.map((name, index) => {
            const t = categoriesTypes[index];
            t.categoryNames.map(name => categoryIDs[name] = this._getCategoryIDFromString(name, false));
            columns.push(t);
        });
        return  new Metadata(categoryIDs, columns, featureCount, sample);
    }

    /**
     * Return an object with the names of the columns clasified by type.
     */
    async _getColumnTypes(query, conf) {
        const fields = await this.getColumnTypes(query, conf);
        let numerics = [];
        let categories = [];
        let dates = [];
        Object.keys(fields).map(name => {
            const type = fields[name].type;
            if (type == 'number') {
                numerics.push(name);
            } else if (type == 'string') {
                categories.push(name);
            } else if (type == 'date') {
                dates.push(name);
            } else if (type != 'geometry') {
                throw new Error(`Unsuportted type ${type}`);
            }
        });

        return { numerics, categories, dates };
    }

    async getSample(conf, sampling) {
        let q;
        if (this._source._tableName) {
            q = `SELECT * FROM ${this._source._tableName} TABLESAMPLE BERNOULLI (${100 * sampling}) REPEATABLE (0);`;
        } else {
            // Fallback to random() since 'TABLESAMPLE BERNOULLI' is not supported on queries
            q = `WITH _rndseed as (SELECT setseed(0.5))
                    SELECT * FROM (${this._source._query}) as _cdb_query_wrapper WHERE random() < ${sampling};`;
        }

        const response = await getSQL(q, conf);
        const json = await response.json();
        return json.rows;
    }

    // Returns the total feature count, including possibly filtered features
    async getFeatureCount(query, conf) {
        const q = `SELECT COUNT(*) FROM ${query};`;
        const response = await getSQL(q, conf);
        const json = await response.json();
        return json.rows[0].count;
    }

    async getColumnTypes(query, conf) {
        const columnListQuery = `select * from ${query} limit 0;`;
        const response = await getSQL(columnListQuery, conf);
        const json = await response.json();
        return json.fields;
    }

    async getGeometryType(query, conf) {
        const columnListQuery = `SELECT ST_GeometryType(the_geom) AS type FROM ${query} WHERE the_geom IS NOT NULL LIMIT 1;`;
        const response = await getSQL(columnListQuery, conf);
        const json = await response.json();
        const type = json.rows[0].type;
        switch (type) {
            case 'ST_MultiPolygon':
                return 'polygon';
            case 'ST_Point':
                return 'point';
            case 'ST_MultiLineString':
                return 'line';
            default:
                throw new Error(`Unimplemented geometry type ''${type}'`);
        }
    }

    async getNumericTypes(names, query, conf) {
        const aggFns = ['min', 'max', 'sum', 'avg'];
        const numericsSelect = names.map(name =>
            aggFns.map(fn => `${fn}(${name}) AS ${name}_${fn}`)
        ).concat(['COUNT(*)']).join();
        const numericsQuery = `SELECT ${numericsSelect} FROM ${query};`;
        const response = await getSQL(numericsQuery, conf);
        const json = await response.json();
        return names.map(name => {
            return {
                name,
                type: 'float',
                min: json.rows[0][`${name}_min`],
                max: json.rows[0][`${name}_max`],
                avg: json.rows[0][`${name}_avg`],
                sum: json.rows[0][`${name}_sum`],
            };
        }
        );
    }

    _getDateFromStr(str) {
        if (Number.isNaN(Date.parse(str))) {
            throw new Error(`Invalid date: '${str}'`);
        }
        return new Date(str);
    }

    async getDatesTypes(names, query, conf) {
        if (names.length == 0) {
            return [];
        }
        const aggFns = ['min', 'max'];
        const datesSelect = names.map(name =>
            aggFns.map(fn => `${fn}(${name}) AS ${name}_${fn}`)
        ).join();
        const numericsQuery = `SELECT ${datesSelect} FROM ${query};`;
        const response = await getSQL(numericsQuery, conf);
        const json = await response.json();
        return names.map(name => {
            return {
                name,
                type: 'date',
                min: this._getDateFromStr(json.rows[0][`${name}_min`]),
                max: this._getDateFromStr(json.rows[0][`${name}_max`]),
            };
        }
        );
    }

    async getCategoryTypes(names, query, conf) {
        return Promise.all(names.map(async name => {
            const catQuery = `SELECT COUNT(*), ${name} AS name FROM ${query} GROUP BY ${name} ORDER BY COUNT(*) DESC;`;
            const response = await getSQL(catQuery, conf);
            const json = await response.json();
            let counts = [];
            let names = [];
            json.rows.map(row => {
                counts.push(row.count);
                names.push(row.name);
            });
            return {
                name,
                type: 'category',
                categoryNames: names,
                categoryCounts: counts
            };
        }));
    }
}


function isClockWise(vertices) {
    let a = 0;
    for (let i = 0; i < vertices.length; i++) {
        let j = (i + 1) % vertices.length;
        a += vertices[i].x * vertices[j].y;
        a -= vertices[j].x * vertices[i].y;
    }
    return a > 0;
}

const endpoint = (conf, path = '') => {
    let url = `${conf.mapsServerURL}/api/v1/map`;
    if (path) {
        url += '/' + path;
    }
    url = authURL(url, conf);
    return url;
};

function getLayerUrl(layergroup, layerIndex, conf) {
    if (layergroup.cdn_url && layergroup.cdn_url.templates) {
        const urlTemplates = layergroup.cdn_url.templates.https;
        return authURL(`${urlTemplates.url}/${conf.username}/api/v1/map/${layergroup.layergroupid}/${layerIndex}/{z}/{x}/{y}.mvt`, conf);
    }
    return endpoint(conf, `${layergroup.layergroupid}/${layerIndex}/{z}/{x}/{y}.mvt`);
}

function getSQL(query, conf) {
    let url = `${conf.sqlServerURL}/api/v2/sql?q=` + encodeURIComponent(query);
    url = authURL(url, conf);
    return fetch(url);
}

function authURL(url, conf) {
    if (conf.apiKey) {
        const sep = url.includes('?') ? '&' : '?';
        url += sep + 'api_key=' + encodeURIComponent(conf.apiKey);
    }
    return url;
}

/**
 * Responsabilities: get tiles, decode tiles, return dataframe promises, optionally: cache, coalesce all layer with a source engine, return bound dataframes
 */
