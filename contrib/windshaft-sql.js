import * as rsys from './rsys';
import * as R from '../src/index';

var VectorTile = require('@mapbox/vector-tile').VectorTile;
var Protobuf = require('pbf');
var LRU = require("lru-cache");


var style;
var oldtiles = [];

const user = 'dmanzanares-ded13';
const endpoint = (username) => {
    return `http://${user}.carto-staging.com/api/v1/map?api_key=8a174c451215cb8dca90264de342614087c4ef0c`
}
const layerUrl = function url(layergroup, layerIndex) {
    return (x, y, z) => {
        if (layergroup.cdn_url && layergroup.cdn_url.templates) {
            const urlTemplates = layergroup.cdn_url.templates.https;
            return `${urlTemplates.url}/${user}/api/v1/map/${layergroup.layergroupid}/${layerIndex}/${z}/${x}/${y}.mvt?api_key=8a174c451215cb8dca90264de342614087c4ef0c`.replace('{s}', '1');
        }
        return `${endpoint(user)}/${layergroup.layergroupid}/${layerIndex}/${z}/${x}/${y}.mvt`.replace('{s}', '1');
    }
}
const layerSubdomains = function subdomains(layergroup) {
    if (layergroup.cdn_url && layergroup.cdn_url.templates) {
        const urlTemplates = layergroup.cdn_url.templates.https;
        return urlTemplates.subdomains;
    }
    return [];
}

class Provider { }

export default class WindshaftSQL extends Provider {
    constructor(renderer) {
        super();
        this.renderer = renderer;
        this.catMap = {};
        const options = {
            max: 1000
            , length: function (dataframe, key) { return 1; }
            , dispose: (key, promise) => {
                promise.then(dataframe => {
                    if (!dataframe.empty) {
                        dataframe.free();
                        this.renderer.removeDataframe(dataframe);
                    }
                })
            }
            , maxAge: 1000 * 60 * 60
        };
        this.cache = LRU(options);
    }
    setQueries(protoSchema) {

        let agg = {
            threshold: 1,
            resolution: protoSchema.aggRes,
            columns: {},
            dimensions: {}
        };
        protoSchema.propertyList.map(p => {
            p.aggFN.forEach(fn => {
                if (fn != 'raw') {
                    agg.columns[p.name + '_' + fn] = {
                        aggregate_function: fn,
                        aggregated_column: p.name
                    };
                }
            })
        });
        protoSchema.propertyList.map(p => {
            const name = p.name;
            const aggFN = p.aggFN;
            if (aggFN.has('raw')) {
                agg.dimensions[p.name] = p.name;
            }
        });
        const aggSQL = `SELECT ${protoSchema.propertyList.map(p => p.name).concat(['the_geom', 'the_geom_webmercator']).join()} FROM tx_0125_copy_copy`;

        console.log(aggSQL, agg);

        const sqls = `SELECT
        the_geom_webmercator, the_geom,
        temp, DATE_PART('day', date::timestamp-'1912-12-31 01:00:00'::timestamp )::numeric AS day
    FROM wwi_ships_1`;

        const sql = `SELECT
    the_geom_webmercator,the_geom,
    amount,
   category
FROM tx_0125_copy_copy`;

        //TODO agg is param


        const mapConfigAgg = {
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

        const promise = async () => {
            const response = await fetch(endpoint(user), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(mapConfigAgg)
            });
            const layergroup = await response.json();
            console.log(layergroup);
            return layerUrl(layergroup, 0);
        };

        this.url = promise();

        //block data acquisition
        this.style = null;
        this.schema = getSchema(`(${aggSQL}) AS tmp`, protoSchema).then(schema => {
            console.log(schema);
            this.style = new R.Style.Style(this.renderer, schema);
            return schema;
        });
        this.cache.reset();
        oldtiles.forEach(t => t.free());
        oldtiles.forEach(t => this.renderer.removeDataframe(t));
        oldtiles = [];
        this.schema.then(schema => {
            this.style = new R.Style.Style(this.renderer, schema);
            this.getData();
        });
    }
    async getSchema() {
        return await this.schema;
    }
    getCatID(catName, catStr, schema, pName) {
        const index = schema.properties[pName].type.categoryNames.indexOf(catStr);
        return schema.properties[pName].type.categoryIDs[index];
    }
    getDataframe(x, y, z, callback) {
        const id = `${x},${y},${z}`;
        const c = this.cache.get(id);
        if (c) {
            c.then(callback);
            return;
        }
        const promise = this.requestDataframe(x, y, z);
        this.cache.set(id, promise);
        promise.then(callback);
    }
    requestDataframe(x, y, z) {
        return new Promise((callback, reject) => {
            const mvt_extent = 4096;

            this.url.then(url => {
                //renderer.getMin(null, (result) => console.log(`${JSON.stringify(result)} computed!`));
                var oReq = new XMLHttpRequest();
                oReq.responseType = "arraybuffer";
                const hack = `https://cartocdn-ashbu_a.global.ssl.fastly.net/dmanzanares/api/v1/map/dmanzanares@2d3b4521@81f53959cba25cbdde88e1b6e563989f:1510050059310/mapnik/${z}/${x}/${y}.mvt`;
                //console.log(url(x, y, z));
                oReq.open("GET", url(x, y, z), true);
                oReq.onload = (oEvent) => {
                    this.schema.then(schema => {
                        if (oReq.response.byteLength == 0 || oReq.response == 'null') {
                            callback({ empty: true });
                            return;
                        }
                        var tile = new VectorTile(new Protobuf(oReq.response));
                        const mvtLayer = tile.layers[Object.keys(tile.layers)[0]];
                        var fieldMap = {};

                        const numFields = [];
                        const catFields = [];
                        const catFieldsReal = [];
                        const numFieldsReal = [];
                        schema.propertyList.map(p =>
                            p.aggFN.forEach(fn => {
                                let name = p.name;
                                if (fn != 'raw') {
                                    name = p.name + '_' + fn;
                                }
                                if (p.type instanceof R.schema.Category) {
                                    catFields.push(name);
                                    catFieldsReal.push(p.name);
                                } else {
                                    numFields.push(name);
                                    numFieldsReal.push(p.name);
                                }
                            })
                        );
                        catFieldsReal.map((name, i) => fieldMap[name] = i);
                        numFieldsReal.map((name, i) => fieldMap[name] = i + catFields.length);
                        if (!mvtLayer) {
                            debugger;
                        }
                        var properties = [new Float32Array(mvtLayer.length + 1024), new Float32Array(mvtLayer.length + 1024), new Float32Array(mvtLayer.length + 1024), new Float32Array(mvtLayer.length + 1024)];
                        var points = new Float32Array(mvtLayer.length * 2);
                        const r = Math.random();
                        for (var i = 0; i < mvtLayer.length; i++) {
                            const f = mvtLayer.feature(i);
                            const geom = f.loadGeometry();
                            points[2 * i + 0] = 2 * (geom[0][0].x) / mvt_extent - 1.;
                            points[2 * i + 1] = 2 * (1. - (geom[0][0].y) / mvt_extent) - 1.;
                            catFields.map((name, index) => {
                                properties[index][i] = this.getCatID(name, f.properties[name], schema, catFieldsReal[index]);
                            });
                            numFields.map((name, index) => {
                                properties[index + catFields.length][i] = Number(f.properties[name]);
                            });
                        }
                        var rs = rsys.getRsysFromTile(x, y, z);
                        let dataframeProperties = {};
                        Object.keys(fieldMap).map((name, pid) => {
                            dataframeProperties[name] = properties[pid];
                        });
                        var dataframe = new R.Dataframe(
                            rs.center,
                            rs.scale,
                            points,
                            dataframeProperties,
                        );
                        dataframe.schema = schema;
                        dataframe.size = mvtLayer.length;
                        this.renderer.addDataframe(dataframe).setStyle(this.style)
                        callback(dataframe);
                    });
                }
                oReq.send(null);
            });
        });
    }
    getData() {
        if (!this.style) {
            return;
        }
        const renderer = this.renderer;
        const bounds = renderer.getBounds();
        const aspect = renderer.getAspect();
        const tiles = rsys.rTiles(bounds);
        var completedTiles = [];
        var needToComplete = tiles.length;
        tiles.forEach(t => {
            const x = t.x;
            const y = t.y;
            const z = t.z;
            this.getDataframe(x, y, z, dataframe => {
                if (dataframe.empty) {
                    needToComplete--;
                } else {
                    completedTiles.push(dataframe);
                }
                if (completedTiles.length == needToComplete) {
                    oldtiles.forEach(t => t.setStyle(null));
                    completedTiles.map(t => t.setStyle(this.style));
                    oldtiles = completedTiles;
                }
            });
        });
    }
}

async function getColumnTypes(query) {
    const columnListQuery = `select * from ${query} limit 0;`;
    const response = await fetch("https://dmanzanares-core.carto.com/api/v2/sql?q=" + encodeURIComponent(columnListQuery));
    const json = await response.json();
    return json.fields;
}

async function getNumericTypes(names, query) {
    const aggFns = ['min', 'max', 'sum', 'avg'];
    const numericsSelect = names.map(name =>
        aggFns.map(fn => `${fn}(${name}) AS ${name}_${fn}`)
    ).concat(['COUNT(*)']).join();
    const numericsQuery = `SELECT ${numericsSelect} FROM ${query};`
    const response = await fetch("https://dmanzanares-core.carto.com/api/v2/sql?q=" + encodeURIComponent(numericsQuery));
    const json = await response.json();
    console.log(numericsQuery, json);
    // TODO avg, sum, count
    return names.map(name =>
        new R.schema.Float(json.rows[0][`${name}_min`], json.rows[0][`${name}_max`])
    );
}

async function getCategoryTypes(names, query) {
    return Promise.all(names.map(async name => {
        const catQuery = `SELECT COUNT(*), ${name} AS name FROM ${query} GROUP BY ${name} ORDER BY COUNT(*) DESC;`
        const response = await fetch("https://dmanzanares-core.carto.com/api/v2/sql?q=" + encodeURIComponent(catQuery));
        const json = await response.json();
        let counts = [];
        let names = [];
        let ids = [];
        json.rows.map((row, id) => {
            counts.push(row.count);
            names.push(row.name);
            ids.push(id);
        })
        return new R.schema.Category(names, counts, ids);
    }));
}


async function getSchema(query, proto) {
    //Get column names and types with a limit 0
    //Get min,max,sum and count of numerics
    //for each category type
    //Get category names and counts by grouping by
    //Assign ids

    const fields = await getColumnTypes(query);
    let numerics = [];
    let categories = [];
    Object.keys(fields).map(name => {
        const type = fields[name].type;
        if (type == 'number') {
            numerics.push(name);
            //proto[name].type = 'number';
        } else if (type == 'string') {
            categories.push(name);
            //proto[name].type = 'category';
        }
    })

    const numericsTypes = await getNumericTypes(numerics, query);
    const categoriesTypes = await getCategoryTypes(categories, query);

    numerics.map((name, index) => {
        const t = numericsTypes[index];
        proto.properties[name].type = t;
    });
    categories.map((name, index) => {
        const t = categoriesTypes[index];
        proto.properties[name].type = t;
    });
    //const schema = new R.schema.Schema(numerics.concat(categories), numericsTypes.concat(categoriesTypes));
    return proto;
}
