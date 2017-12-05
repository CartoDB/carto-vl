import * as rsys from './rsys';
import * as R from '../src/index';

var VectorTile = require('@mapbox/vector-tile').VectorTile;
var Protobuf = require('pbf');

export { getData, schema, init };

var oldtiles = [];
var ajax;
const names = ['Moda y calzado',
    'Bares y restaurantes', 'Salud', 'Alimentación'];
var schema = new R.schema.Schema(['category', 'amount'], [new R.schema.Category(names
    , [33263, 24633, 17833, 16907], [0, 1, 2, 3]), new R.schema.Float(2, 100 * 1000)]);
getSchema();
var style;

function init(fixedStyle) {
    style = fixedStyle;
}

var catMap = {};
function getCatID(catStr) {
    const f = names.indexOf(catStr);
    return f;

    if (catMap[catStr]) {
        return catMap[catStr];
    }
    catMap[catStr] = Object.keys(catMap).length + 1;
    return catMap[catStr];
}

async function getColumnTypes() {
    const columnListQuery = `select * from tx_0125_copy_copy limit 0;`;
    const response = await fetch("https://dmanzanares-core.carto.com/api/v2/sql?q=" + encodeURIComponent(columnListQuery));
    const json = await response.json();
    return json.fields;
}

async function getNumericTypes(names) {
    const aggFns = ['min', 'max', 'sum', 'avg'];
    const numericsSelect = names.map(name =>
        aggFns.map(fn => `${fn}(${name}) AS ${name}_${fn}`)
    ).concat(['COUNT(*)']).join();
    const numericsQuery = `SELECT ${numericsSelect} FROM tx_0125_copy_copy;`
    const response = await fetch("https://dmanzanares-core.carto.com/api/v2/sql?q=" + encodeURIComponent(numericsQuery));
    const json = await response.json();
    console.log(numericsQuery, json);
    // TODO avg, sum, count
    return names.map(name =>
        new R.schema.Float(json.rows[0][`${name}_min`], json.rows[0][`${name}_max`])
    );
}

async function getCategoryTypes(names) {
    const aggFns = ['min', 'max', 'sum', 'avg'];
    const numericsSelect = names.map(name =>
        aggFns.map(fn => `${fn}(${name}) AS ${name}_${fn}`)
    ).concat(['COUNT(*)']).join();
    const numericsQuery = `SELECT ${numericsSelect} FROM tx_0125_copy_copy;`
    const response = await fetch("https://dmanzanares-core.carto.com/api/v2/sql?q=" + encodeURIComponent(numericsQuery));
    const json = await response.json();
    console.log(numericsQuery, json);

    return names.map(name => {
        console.log("ASD", json.rows[0][`${name}_min`])
        return new R.schema.Float(json.rows[0][`${name}_min`], json.rows[0][`${name}_max`])
    }
    );
}


async function getSchema() {
    //Get column names and types with a limit 0
    //Get min,max,sum and count of numerics
    //for each category type
    //Get category names and counts by grouping by
    //Assign ids

    const fields = await getColumnTypes();
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

    const numericsTypes = await getNumericTypes(numerics);
    const categoriesTypes = [];//await getCategoryTypes(categories);

    const schema = new R.schema.Schema(numerics.concat([]), numericsTypes.concat(categoriesTypes));
    console.log(schema, numericsTypes);
    return schema;
}

function getData(renderer) {
    const bounds = renderer.getBounds();
    const aspect = renderer.getAspect();
    const tiles = rsys.rTiles(bounds);
    var completedTiles = [];
    var needToComplete = tiles.length;
    tiles.forEach(t => {
        const x = t.x;
        const y = t.y;
        const z = t.z;
        const mvt_extent = 1024;
        const subpixelBufferSize = 0;
        const query =
            `select st_asmvt(geom, 'lid') FROM
        (
            SELECT
                ST_AsMVTGeom(
                    ST_SetSRID(ST_MakePoint(avg(ST_X(the_geom_webmercator)), avg(ST_Y(the_geom_webmercator))),3857),
                    CDB_XYZ_Extent(${x},${y},${z}), ${mvt_extent}, ${subpixelBufferSize}, false
                ),
                SUM(amount) AS amount,
                _cdb_mode(category) AS category
            FROM tx_0125_copy_copy AS cdbq
            WHERE the_geom_webmercator && CDB_XYZ_Extent(${x},${y},${z})
            GROUP BY ST_SnapToGrid(the_geom_webmercator, CDB_XYZ_Resolution(${z})*3)
            ORDER BY amount DESC
        )AS geom
    `;
        renderer.getMin(null, (result) => console.log(`${JSON.stringify(result)} computed!`));
        var oReq = new XMLHttpRequest();
        oReq.open("GET", "https://dmanzanares-core.carto.com/api/v2/sql?q=" + encodeURIComponent(query) + "", true);
        oReq.onload = function (oEvent) {
            const json = JSON.parse(oReq.response);
            if (json.rows[0].st_asmvt.data.length == 0) {
                needToComplete--;
                if (completedTiles.length == needToComplete) {
                    oldtiles.forEach(t => renderer.removeDataframe(t));
                    completedTiles.forEach(f => renderer.addDataframe(f).setStyle(style));
                    oldtiles = completedTiles;
                }
                return;
            }
            var tile = new VectorTile(new Protobuf(new Uint8Array(json.rows[0].st_asmvt.data)));
            const mvtLayer = tile.layers[Object.keys(tile.layers)[0]];
            var fieldMap = {
                category: 0,
                amount: 1
            };
            var properties = [[new Float32Array(mvtLayer.length)], [new Float32Array(mvtLayer.length)]];
            var points = new Float32Array(mvtLayer.length * 2);
            const r = Math.random();
            for (var i = 0; i < mvtLayer.length; i++) {
                const f = mvtLayer.feature(i);
                const geom = f.loadGeometry();
                points[2 * i + 0] = 2 * (geom[0][0].x) / mvt_extent - 1.;
                points[2 * i + 1] = 2 * (1. - (geom[0][0].y) / mvt_extent) - 1.;
                properties[0][i] = Number(getCatID(f.properties.category));
                properties[1][i] = Number(f.properties.amount);
            }
            //console.log(`dataframe feature count: ${mvtLayer.length} ${x},${y},${z}`+properties[0]);
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
            completedTiles.push(dataframe);
            if (completedTiles.length == needToComplete) {
                oldtiles.forEach(t => renderer.removeDataframe(t));
                completedTiles.forEach(f => renderer.addDataframe(f).setStyle(style));
                oldtiles = completedTiles;
            }
        };
        oReq.send(null);
    });
}