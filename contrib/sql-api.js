import * as rsys from './rsys';
import * as R from '../src/index';

var VectorTile = require('@mapbox/vector-tile').VectorTile;
var Protobuf = require('pbf');
var LRU = require("lru-cache");

export { SQL_API, init };

var style;
var oldtiles = [];

class Provider { }

class SQL_API extends Provider {
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
    setQueries(query, renderQueryMaker) {
        //block data acquisition
        this.style = null;
        this.renderQueryMaker = renderQueryMaker;
        this.schema = getSchema(query).then(schema => {
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
    getCatID(catName, catStr, schema) {
        const index = schema[catName].categoryNames.indexOf(catStr);
        return schema[catName].categoryIDs[index];
        this.catMap[catName] = this.catMap[catName] || {};
        let catMap = this.catMap[catName];
        if (catMap[catStr]) {
            return catMap[catStr];
        }
        catMap[catStr] = Object.keys(catMap).length + 1;
        return catMap[catStr];
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
            const mvt_extent = 1024;
            const query = this.renderQueryMaker(x, y, z);

            var oReq = new XMLHttpRequest();
            oReq.open("GET", "https://dmanzanares-core.carto.com/api/v2/sql?q=" + encodeURIComponent(query) + "", true);
            oReq.onload = (oEvent) => {
                this.schema.then(schema => {
                    const json = JSON.parse(oReq.response);
                    if (json.rows[0].st_asmvt.data.length == 0) {
                        callback({ empty: true });
                        return;
                    }
                    var tile = new VectorTile(new Protobuf(new Uint8Array(json.rows[0].st_asmvt.data)));
                    const mvtLayer = tile.layers[Object.keys(tile.layers)[0]];
                    var fieldMap = {};
                    Object.keys(schema).map((name, i) => {
                        fieldMap[name] = i;
                    });
                    var properties = [new Float32Array(mvtLayer.length + 1024), new Float32Array(mvtLayer.length + 1024)];
                    var points = new Float32Array(mvtLayer.length * 2);
                    const r = Math.random();
                    for (var i = 0; i < mvtLayer.length; i++) {
                        const f = mvtLayer.feature(i);
                        const geom = f.loadGeometry();
                        points[2 * i + 0] = 2 * (geom[0][0].x) / mvt_extent - 1.;
                        points[2 * i + 1] = 2 * (1. - (geom[0][0].y) / mvt_extent) - 1.;
                        Object.keys(schema).map((name, index) => {
                            if (schema[name] instanceof R.schema.Category) {
                                properties[index][i] = this.getCatID(name, f.properties[name], schema);
                            } else {
                                properties[index][i] = f.properties[name];
                            }
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


async function getSchema(query) {
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
        } else if (type == 'string') {
            categories.push(name);
        }
    })

    const numericsTypes = await getNumericTypes(numerics, query);
    const categoriesTypes = await getCategoryTypes(categories, query);
    const schema = new R.schema.Schema(numerics.concat(categories), numericsTypes.concat(categoriesTypes));
    return schema;
}