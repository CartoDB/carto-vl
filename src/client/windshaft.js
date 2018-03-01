import * as R from '../core/renderer';
import * as rsys from './rsys';

import * as Protobuf from 'pbf';
import * as LRU from 'lru-cache';
import * as windshaftFiltering from './windshaft-filtering';
import { VectorTile } from '@mapbox/vector-tile';

const SAMPLE_ROWS = 1000;
const MIN_FILTERING = 500000;

// Get dataframes <- MVT <- Windshaft
// Get metadata
// Instantiate map Windshaft
// Requrest SQL API (temp)
// Cache dataframe

export default class Windshaft {

    constructor(source) {
        this._source = source;

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

    /**
     * Should be called whenever the viewport or the style changes
     * Returns falseable if the metadata didn't changed, or a promise to a Metadata if it did change
     * @param {*} viewport
     * @param {*} MNS
     * @param {*} addDataframe
     * @param {*} styleDataframe
     */
    getData(viewport, style) {
        const MNS = style.getMinimumNeededSchema();
        const resolution = style.getResolution();
        const filtering = windshaftFiltering.getFiltering(style);
        if (!R.schema.equals(this._MNS, MNS) || resolution != this.resolution ||
            (JSON.stringify(filtering) != JSON.stringify(this.filtering) && this.metadata.featureCount > MIN_FILTERING)) {
            const promise = this.inProgressInstantiations[JSON.stringify(
                {
                    MNS,
                    resolution,
                    filtering: this.metadata && this.metadata.featureCount > MIN_FILTERING ? filtering : null
                })];
            // Only instantiate if the same map is not being resintantiated now
            if (!promise) {
                const p = this._instantiate(MNS, resolution, filtering);
                this.inProgressInstantiations[JSON.stringify({ MNS, resolution })] = p;
                console.log('Instantiating map:', JSON.stringify(MNS));
                p.finally(() => {
                    this.inProgressInstantiations[JSON.stringify({ MNS, resolution })] = null;
                }, () => { }).catch(err => console.log(err));
                return p;
            }
            return promise;
        }
        if (!this.url) {
            // Instantiation is in progress, nothing to do yet
            return;
        }

        const tiles = rsys.rTiles(viewport);
        this._requestGroupID++;
        var completedTiles = [];
        var needToComplete = tiles.length;
        const requestGroupID = this._requestGroupID;
        tiles.forEach(t => {
            // TODO object deconstruction
            const x = t.x;
            const y = t.y;
            const z = t.z;
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

    _getCategoryIDFromString(category) {
        if (this._categoryStringToIDMap[category]) {
            return this._categoryStringToIDMap[category];
        }
        this._numCategories++;
        this._categoryStringToIDMap[category] = this._numCategories;
        return this._numCategories;
    }

    _instantiate(MNS, resolution, filtering) {
        let agg = {
            threshold: 1,
            resolution: resolution,
            columns: {},
            dimensions: {}
        };
        MNS.columns.map(name => {
            if (name.startsWith('_cdb_agg_')) {
                const base = getBase(name);
                const fn = getAggFN(name);
                agg.columns[name] = {
                    aggregate_function: fn,
                    aggregated_column: base,
                };
            } else {
                agg.dimensions[name] = name;
            }
        });
        const select = MNS.columns.map(name => name.startsWith('_cdb_agg_') ? getBase(name) : name).concat(['the_geom', 'the_geom_webmercator']);
        let aggSQL = `SELECT ${select.filter((item, pos) => select.indexOf(item) == pos).join()} FROM ${this._source._query ? `(${this._source._query}) as _cdb_query_wrapper` : this._source._tableName}`;
        agg.placement = 'centroid';
        const query = `(${aggSQL}) AS tmp`;

        const conf = {
            apiKey: this._source._apiKey,
            username: this._source._username,
            serverURL: this._source._serverURL
        };

        const metadataPromise = this.getMetadata(query, MNS, conf);

        return new Promise((resolve, reject) => {
            metadataPromise.then(metadata => {
                if (metadata.featureCount > MIN_FILTERING) {
                    aggSQL = `SELECT ${select.filter((item, pos) => select.indexOf(item) == pos).join()} FROM ${this._source._query ? `(${this._source._query}) as _cdb_query_wrapper` : this._source._tableName} ${windshaftFiltering.getSQLWhere(filtering)}`;
                }
                this._getUrlPromise(query, conf, agg, aggSQL).then(url => {
                    metadataPromise.then((metadata) => {
                        this._oldDataframes = [];
                        this.cache.reset();
                        this.url = url;
                        this.metadata = metadata;
                        this._MNS = MNS;
                        this.filtering = filtering;
                        this.resolution = resolution;

                        resolve(metadata);
                    }, err => {
                        console.log(333, err);
                        reject(err);
                    });
                }).catch(err => {
                    metadataPromise.catch(err => console.log(123, err));

                    reject(err);
                });
            }).catch(err => reject(err));
        });
    }

    free() {
        this.cache.reset();
    }
    _generateDataFrame(rs, geometry, properties, size, type) {
        // TODO: Should the dataframe constructor have type and size parameters?
        const dataframe = new R.Dataframe(
            rs.center,
            rs.scale,
            geometry,
            properties,
        );
        dataframe.type = type;
        dataframe.size = size;

        return dataframe;
    }
    async _getUrlPromise(query, conf, agg, aggSQL) {
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
        const response = await fetch(endpoint(conf), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mapConfigAgg),
        });
        const layergroup = await response.json();
        return layerUrl(layergroup, 0, conf);
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

        return fetch(this.url(x, y, z))
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
                const catFieldsReal = [];
                const numFieldsReal = [];
                this._MNS.columns.map(name => {
                    const basename = name.startsWith('_cdb_agg_') ? getBase(name) : name;
                    if (this.metadata.columns.find(c => c.name == basename).type == 'category') {
                        catFields.push(name);
                        catFieldsReal.push(name);
                    } else {
                        numFields.push(name);
                        numFieldsReal.push(name);
                    }

                }
                );
                catFieldsReal.map((name, i) => fieldMap[name] = i);
                numFieldsReal.map((name, i) => fieldMap[name] = i + catFields.length);

                const { points, featureGeometries, properties } = this._decodeMVTLayer(mvtLayer, this.metadata, mvt_extent, catFields, catFieldsReal, numFields);

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

    _decodeMVTLayer(mvtLayer, metadata, mvt_extent, catFields, catFieldsReal, numFields) {
        var properties = [new Float32Array(mvtLayer.length + 1024), new Float32Array(mvtLayer.length + 1024), new Float32Array(mvtLayer.length + 1024), new Float32Array(mvtLayer.length + 1024)];
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
        }

        return { properties, points, featureGeometries };
    }
    async getMetadata(query, proto, conf) {
        //Get column names and types with a limit 0
        //Get min,max,sum and count of numerics
        //for each category type
        //Get category names and counts by grouping by
        //Assign ids
        const metadata = {
            columns: [],
        };
        const fields = await this.getColumnTypes(query, conf);
        let numerics = [];
        let categories = [];
        Object.keys(fields).map(name => {
            const type = fields[name].type;
            if (type == 'number') {
                numerics.push(name);
            } else if (type == 'string') {
                categories.push(name);
            }
        });

        metadata.featureCount = await this.getFeatureCount(query, conf);
        const numericsTypes = await this.getNumericTypes(numerics, query, conf);
        const categoriesTypes = await this.getCategoryTypes(categories, query, conf);
        const sampling = Math.min(SAMPLE_ROWS / metadata.featureCount, 1);
        const sample = await this.getSample(conf, sampling);

        numerics.map((name, index) => {
            const t = numericsTypes[index];
            metadata.columns.push(t);
        });
        metadata.categoryIDs = {};
        metadata.sample = sample;
        categories.map((name, index) => {
            const t = categoriesTypes[index];
            t.categoryNames.map(name => metadata.categoryIDs[name] = this._getCategoryIDFromString(name));
            metadata.columns.push(t);
        });
        return metadata;
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

        const response = await fetch(`${conf.serverURL}/api/v2/sql?q=` + encodeURIComponent(q));
        const json = await response.json();
        console.log(json);
        return json.rows;
    }

    async getFeatureCount(query, conf) {
        const q = `SELECT COUNT(*) FROM ${query};`;
        const response = await fetch(`${conf.serverURL}/api/v2/sql?q=` + encodeURIComponent(q));
        const json = await response.json();
        return json.rows[0].count;
    }

    async getColumnTypes(query, conf) {
        const columnListQuery = `select * from ${query} limit 0;`;
        const response = await fetch(`${conf.serverURL}/api/v2/sql?q=` + encodeURIComponent(columnListQuery));
        const json = await response.json();
        return json.fields;
    }

    async getGeometryType(query, conf) {
        const columnListQuery = `SELECT ST_GeometryType(the_geom) AS type FROM ${query} WHERE the_geom IS NOT NULL LIMIT 1;`;
        const response = await fetch(`${conf.serverURL}/api/v2/sql?q=` + encodeURIComponent(columnListQuery));
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
        const response = await fetch(`${conf.serverURL}/api/v2/sql?q=` + encodeURIComponent(numericsQuery));
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

    async getCategoryTypes(names, query, conf) {
        return Promise.all(names.map(async name => {
            const catQuery = `SELECT COUNT(*), ${name} AS name FROM ${query} GROUP BY ${name} ORDER BY COUNT(*) DESC;`;
            const response = await fetch(`${conf.serverURL}/api/v2/sql?q=` + encodeURIComponent(catQuery));
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

function getBase(name) {
    return name.replace(/_cdb_agg_[a-zA-Z0-9]+_/g, '');
}

function getAggFN(name) {
    let s = name.substr('_cdb_agg_'.length);
    return s.substr(0, s.indexOf('_'));
}

const endpoint = (conf) => {
    return `${conf.serverURL}/api/v1/map?api_key=${conf.apiKey}`;
};

const layerUrl = function (layergroup, layerIndex, conf) {
    let subdomainIndex = 0;
    return (x, y, z) => {
        subdomainIndex++;
        if (layergroup.cdn_url && layergroup.cdn_url.templates) {
            const urlTemplates = layergroup.cdn_url.templates.https;
            return `${urlTemplates.url}/${conf.username}/api/v1/map/${layergroup.layergroupid}/${layerIndex}/${z}/${x}/${y}.mvt?api_key=${conf.apiKey}`.replace('{s}',
                layergroup.cdn_url.templates.https.subdomains[subdomainIndex % layergroup.cdn_url.templates.https.subdomains.length]);
        }
        return `${endpoint(conf)}/${layergroup.layergroupid}/${layerIndex}/${z}/${x}/${y}.mvt`.replace('{s}',
            layergroup.cdn_url.templates.https.subdomains[subdomainIndex % layergroup.cdn_url.templates.https.subdomains.length]);
    };
};

/**
 * Responsabilities: get tiles, decode tiles, return dataframe promises, optionally: cache, coalesce all layer with a source engine, return bound dataframes
 */
