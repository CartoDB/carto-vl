import * as rsys from './rsys';
import * as R from '../src/index';

var VectorTile = require('@mapbox/vector-tile').VectorTile;
var Protobuf = require('pbf');

export { getData, schema, init };

var oldtiles = [];
var ajax;
const names =['Moda y calzado',
'Bares y restaurantes', 'Salud', 'Alimentación'];
var schema = new R.schema.Schema(['category', 'amount'], [new R.schema.Category(names
    , [33263, 24633, 17833, 16907], [0, 1, 2, 3]), new R.schema.Float(2, 100 * 1000)]);
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
            var dataframe = {
                center: rs.center,
                scale: rs.scale,
                geom: points,
                properties: {},
            };
            Object.keys(fieldMap).map((name, pid) => {
                dataframe.properties[name] = properties[pid];
            });
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