import * as R from '../core/renderer';
import * as rsys from './rsys';
import Dataframe from '../core/dataframe';
import * as Protobuf from 'pbf';
import * as LRU from 'lru-cache';
import * as windshaftFiltering from './windshaft-filtering';
import { VectorTile } from '@mapbox/vector-tile';
import Metadata from '../core/metadata';
import { version } from '../../package';

import featureDecoder from './mvt/feature-decoder';

const SAMPLE_ROWS = 1000;
const MIN_FILTERING = 2000000;

const geometryTypes = {
    UNKNOWN: 'unknown',
    POINT: 'point',
    LINE: 'line',
    POLYGON: 'polygon'
};

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

    _getInstantiationID(MNS, resolution, filtering, choices) {
        return JSON.stringify({
            MNS,
            resolution,
            filtering: choices.backendFilters ? filtering : null,
            options: choices
        });
    }

    /**
     * Should be called whenever the viz changes (even if metadata is not going to be used)
     * This not only computes metadata: it also updates the map (instantiates) for the new viz if needed
     * Returns  a promise to a Metadata
     * @param {*} viz
     */
    async getMetadata(viz) {
        const MNS = viz.getMinimumNeededSchema();
        const resolution = viz.resolution;
        const filtering = windshaftFiltering.getFiltering(viz, { exclusive: this._exclusive });
        // Force to include `cartodb_id` in the MNS columns.
        // TODO: revisit this request to Maps API
        if (!MNS.columns.includes('cartodb_id')) {
            MNS.columns.push('cartodb_id');
        }
        if (this._needToInstantiate(MNS, resolution, filtering)) {
            const instantiationData = await this._repeatableInstantiate(MNS, resolution, filtering);
            this._updateStateAfterInstantiating(instantiationData);
        }
        return this.metadata;
    }

    /**
     * After calling getMetadata(), data for a viewport can be obtained with this function.
     * So long as the viz doesn't change, getData() can be called repeatedly for different
     * viewports. If viz changes getMetadata() should be called before requesting data
     * for the new viz.
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
        return !R.schema.equals(this._MNS, MNS)
            || resolution != this.resolution
            || (
                JSON.stringify(filtering) != JSON.stringify(this.filtering)
                && this.metadata.featureCount > MIN_FILTERING
            );
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

    _intantiationChoices(metadata) {
        let choices = {
            // default choices
            backendFilters: true,
            castColumns: []
        };
        if (metadata) {
            if (metadata.featureCount >= 0) {
                choices.backendFilters = metadata.featureCount > MIN_FILTERING || !metadata.backendFiltersApplied;
            }
            if (metadata.columns) {
                choices.castColumns = metadata.columns.filter(c => c.type == 'date').map(c => c.name);
            }
        }
        return choices;
    }

    async _instantiateUncached(MNS, resolution, filters, choices = { backendFilters: true, castColumns: [] }, overrideMetadata = null) {
        const conf = this._getConfig();
        const agg = await this._generateAggregation(MNS, resolution);
        let select = this._buildSelectClause(MNS, choices.castColumns);
        let aggSQL = this._buildQuery(select);

        const query = `(${aggSQL}) AS tmp`;

        let backendFilters = choices.backendFilters ? filters : null;
        let backendFiltersApplied = false;

        if (backendFilters && this._requiresAggregation(MNS)) {
            agg.filters = windshaftFiltering.getAggregationFilters(backendFilters);
            if (agg.filters) {
                backendFiltersApplied = true;
            }
            if (!this._exclusive) {
                backendFilters = null;
            }
        }
        if (backendFilters) {
            const filteredSQL = this._buildQuery(select, backendFilters);
            backendFiltersApplied = backendFiltersApplied || filteredSQL != aggSQL;
            aggSQL = filteredSQL;
        }

        let { url, metadata } = await this._getInstantiationPromise(query, conf, agg, aggSQL, select, overrideMetadata);
        metadata.backendFiltersApplied = backendFiltersApplied;

        return { MNS, resolution, filters, metadata, urlTemplate: url };
    }

    _updateStateAfterInstantiating({ MNS, resolution, filters, metadata, urlTemplate }) {
        this._oldDataframes = [];
        this.cache.reset();
        this.urlTemplate = urlTemplate;
        this.metadata = metadata;
        this._MNS = MNS;
        this.filtering = filters;
        this.resolution = resolution;
        this._checkLayerMeta(MNS);
    }

    async _instantiate(MNS, resolution, filters, choices, metadata) {
        if (this.inProgressInstantiations[this._getInstantiationID(MNS, resolution, filters, choices)]) {
            return this.inProgressInstantiations[this._getInstantiationID(MNS, resolution, filters, choices)];
        }
        const instantiationPromise = this._instantiateUncached(MNS, resolution, filters, choices, metadata);
        this.inProgressInstantiations[this._getInstantiationID(MNS, resolution, filters, choices)] = instantiationPromise;
        return instantiationPromise;
    }

    async _repeatableInstantiate(MNS, resolution, filters) {
        // TODO: we shouldn't reinstantiate just to not apply backend filters
        // (we'd need to add a choice comparison function argument to repeatablePromise)
        let finalMetadata = null;
        const initialChoices = this._intantiationChoices(this.metadata);
        const finalChoices = instantiation => {
            // first instantiation metadata is kept
            finalMetadata = instantiation.metadata;
            return this._intantiationChoices(instantiation.metadata);
        };
        return repeatablePromise(initialChoices, finalChoices, choices => this._instantiate(MNS, resolution, filters, choices, finalMetadata));
    }

    _checkLayerMeta(MNS) {
        if (!this._isAggregated()) {
            if (this._requiresAggregation(MNS)) {
                throw new Error('Aggregation not supported for this dataset');
            }
        }
    }

    _isAggregated() {
        return this.metadata && this.metadata.isAggregated;
    }

    _requiresAggregation(MNS) {
        return MNS.columns.some(column => R.schema.column.isAggregated(column));
    }

    _generateAggregation(MNS, resolution) {
        let aggregation = {
            columns: {},
            dimensions: {},
            placement: 'centroid',
            resolution: resolution,
            threshold: 1,
        };

        MNS.columns
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

    _buildSelectClause(MNS, dateFields = []) {
        const columns = MNS.columns.map(name => R.schema.column.getBase(name)).map(
            name => dateFields.includes(name) ? name + '::text' : name
        ).concat(['the_geom', 'the_geom_webmercator', 'cartodb_id']);
        return columns.filter((item, pos) => columns.indexOf(item) == pos); // get unique values
    }

    _buildQuery(select, filters) {
        const columns = select.join();
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

    async _getInstantiationPromise(query, conf, agg, aggSQL, columns, overrideMetadata = null) {
        const LAYER_INDEX = 0;
        const mapConfigAgg = {
            buffersize: {
                'mvt': 1
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
        if (!overrideMetadata) {
            const excludedColumns = ['the_geom', 'the_geom_webmercator'];
            const includedColumns = columns.filter(name => !excludedColumns.includes(name));
            mapConfigAgg.layers[0].options.metadata = {
                geometryType: true,
                columnStats: { topCategories: 32768, includeNulls: true },
                sample: {
                    num_rows: SAMPLE_ROWS,
                    include_columns: includedColumns // TODO: when supported by Maps API: exclude_columns: excludedColumns
                }
            };
        }
        const response = await fetch(endpoint(conf), this._getRequestConfig(mapConfigAgg));
        const layergroup = await response.json();
        if (!response.ok) {
            throw new Error(`Maps API error: ${JSON.stringify(layergroup)}`);
        }
        this._subdomains = layergroup.cdn_url ? layergroup.cdn_url.templates.https.subdomains : [];
        return {
            url: getLayerUrl(layergroup, LAYER_INDEX, conf),
            metadata: overrideMetadata || this._adaptMetadata(layergroup.metadata.layers[0].meta)
        };
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
                    } else if (type == 'number') {
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

                const { points, featureGeometries, properties, numFeatures } = this._decodeMVTLayer(mvtLayer, this.metadata, mvt_extent, catFields, numFields, dateFields);

                var rs = rsys.getRsysFromTile(x, y, z);
                let dataframeProperties = {};
                Object.keys(fieldMap).map((name, pid) => {
                    dataframeProperties[name] = properties[pid];
                });
                let dataFrameGeometry = this.metadata.geomType == geometryTypes.POINT ? points : featureGeometries;
                const dataframe = this._generateDataFrame(rs, dataFrameGeometry, dataframeProperties, numFeatures, this.metadata.geomType);
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
        if (metadata.geomType == geometryTypes.POINT) {
            var points = new Float32Array(mvtLayer.length * 2);
        }
        let featureGeometries = [];
        let numFeatures = 0;
        for (var i = 0; i < mvtLayer.length; i++) {
            const f = mvtLayer.feature(i);
            const geom = f.loadGeometry();
            if (metadata.geomType == geometryTypes.POINT) {
                const x = 2 * (geom[0][0].x) / mvt_extent - 1.;
                const y = 2 * (1. - (geom[0][0].y) / mvt_extent) - 1.;
                // Tiles may contain points in the border;
                // we'll avoid here duplicatend points between tiles by excluding the 1-edge
                if (x < -1 || x >= 1 || y < -1 || y >= 1) {
                    continue;
                }
                points[2 * numFeatures + 0] = x;
                points[2 * numFeatures + 1] = y;

            } else if (metadata.geomType == geometryTypes.POLYGON) {
                const decodedPolygons = featureDecoder.decodePolygons(geom, mvt_extent);
                featureGeometries.push(decodedPolygons);
            } else if (metadata.geomType == geometryTypes.LINE) {
                this._decodeLines(geom, featureGeometries, mvt_extent);
            } else {
                throw new Error(`Unimplemented geometry type: '${metadata.geomType}'`);
            }

            catFields.map((name, index) => {
                properties[index][numFeatures] = this._getCategoryIDFromString(f.properties[name]);
            });
            numFields.map((name, index) => {
                properties[index + catFields.length][numFeatures] = Number(f.properties[name]);
            });
            dateFields.map((name, index) => {
                const d = Date.parse(f.properties[name]);
                const metadataColumn = metadata.columns.find(c => c.name == name);
                const min = metadataColumn.min;
                const max = metadataColumn.max;
                const n = (d - min) / (max.getTime() - min.getTime());
                properties[index + catFields.length + numFields.length][numFeatures] = n;
            });
            numFeatures += 1;
        }

        return { properties, points, featureGeometries, numFeatures };
    }

    _adaptMetadata(meta) {
        const { stats, aggregation } = meta;
        const featureCount = stats.hasOwnProperty('featureCount') ? stats.featureCount : stats.estimatedFeatureCount;
        const geomType = adaptGeometryType(stats.geometryType);
        const columns = Object.keys(stats.columns)
            .map(name => Object.assign({ name }, stats.columns[name]))
            .map(col => Object.assign(col, { type: adaptColumnType(col.type) }))
            .map(col => Object.assign(col, adaptColumnValues(col)))
            .filter(col => ['number', 'date', 'category'].includes(col.type));
        const categoryIDs = {};
        columns.forEach(column => {
            if (column.type === 'category' && column.categories) {
                column.categories.forEach(category => {
                    categoryIDs[category.category] = this._getCategoryIDFromString(category.category, false);
                });
                column.categoryNames = column.categories.map(cat => cat.category);
            }
        });
        return new Metadata(categoryIDs, columns, featureCount, stats.sample, geomType, aggregation.mvt);
    }
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

function authURL(url, conf) {
    if (conf.apiKey) {
        const sep = url.includes('?') ? '&' : '?';
        url += sep + 'api_key=' + encodeURIComponent(conf.apiKey);
        url += '&client=' + encodeURIComponent('vl-' + version);
    }
    return url;
}

function adaptGeometryType(type) {
    switch (type) {
        case 'ST_MultiPolygon':
        case 'ST_Polygon':
            return 'polygon';
        case 'ST_Point':
            return 'point';
        case 'ST_MultiLineString':
        case 'ST_LineString':
            return 'line';
        default:
            throw new Error(`Unimplemented geometry type ''${type}'`);
    }
}

function adaptColumnType(type) {
    if (type === 'string') {
        return 'category';
    }
    return type;
}

function adaptColumnValues(column) {
    let adaptedColumn = { name: column.name, type: column.type };
    Object.keys(column).forEach(key => {
        if (!['name', 'type'].includes(key)) {
            adaptedColumn[key] = adaptColumnValue(column[key], column.type);
        }
    });
    return adaptedColumn;
}

function adaptColumnValue(value, type) {
    switch (type) {
        case 'date':
            if (Number.isNaN(Date.parse(value))) {
                throw new Error(`Invalid date: '${value}'`);
            }
            return new Date(value);
        default:
            return value;
    }
}

// generate a promise under certain assumptions/choices; then if the result changes the assumptions,
// repeat the generation with the new information
async function repeatablePromise(initialAssumptions, assumptionsFromResult, promiseGenerator) {
    let promise = promiseGenerator(initialAssumptions);
    let result = await promise;
    let finalAssumptions = assumptionsFromResult(result);
    if (JSON.stringify(initialAssumptions) == JSON.stringify(finalAssumptions)) {
        return promise;
    }
    else {
        return promiseGenerator(finalAssumptions);
    }
}

/**
 * Responsabilities: get tiles, decode tiles, return dataframe promises, optionally: cache, coalesce all layer with a source engine, return bound dataframes
 */
