import * as R from '../src/index';

var VectorTile = require('@mapbox/vector-tile').VectorTile;
var Protobuf = require('pbf');

var renderer;
var oldtiles = [];
var ajax;

var style;
var schema;


function styleWidth(e) {
    const v = document.getElementById("widthStyleEntry").value;
    try {
        style.getWidth().blendTo(R.Style.parseStyleExpression(v, schema), 1000);
        document.getElementById("feedback").value = 'ok';
    } catch (error) {
        const err = `Invalid width expression: ${error}:${error.stack}`;
        console.warn(err);
        document.getElementById("feedback").value = err;
    }
}
function styleColor(e) {
    const v = document.getElementById("colorStyleEntry").value;
    try {
        style.getColor().blendTo(R.Style.parseStyleExpression(v, schema), 1000);
        document.getElementById("feedback").value = 'ok';
    } catch (error) {
        const err = `Invalid color expression: ${error}:${error.stack}`;
        console.warn(err);
        document.getElementById("feedback").value = err;
    }
}

function getTileList(c, iz, aspect) {
    var list = [];
    var z = Math.ceil(Math.log2(1. / iz));
    var x = c.x;
    var y = c.y;
    const numTiles = Math.pow(2, z);
    function saturate(x) {
        return Math.min(Math.max(x, 0), 1);
    }
    const minx = Math.floor(numTiles * saturate((x - iz * aspect) * 0.5 + 0.5));
    const maxx = Math.ceil(numTiles * saturate((x + iz * aspect) * 0.5 + 0.5));
    const miny = Math.floor(numTiles * saturate(1. - ((y + iz) * 0.5 + 0.5)));
    const maxy = Math.ceil(numTiles * saturate(1. - ((y - iz) * 0.5 + 0.5)));
    for (let i = minx; i < maxx; i++) {
        for (let j = miny; j < maxy; j++) {
            list.push({
                x: i,
                y: j,
                z: z
            });
        }
    }
    return list;
}
function getData(aspect) {
    const tiles = getTileList(renderer.getCenter(), renderer.getZoom(), aspect);
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
                SUM(amount) AS amount
            FROM tx_0125_copy_copy AS cdbq
            WHERE the_geom_webmercator && CDB_XYZ_Extent(${x},${y},${z})
            GROUP BY ST_SnapToGrid(the_geom_webmercator, CDB_XYZ_Resolution(${z})*3.)
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
                    styleWidth();
                    styleColor();
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
                properties[0][i] = Number(Math.random());
                //properties[1][i] = Number(Math.random());
                properties[1][i] = Number(f.properties.amount);
                //console.log(f);
                //break;
            }
            //console.log(`dataframe feature count: ${mvtLayer.length} ${x},${y},${z}`);
            var dataframe = {
                center: { x: ((x + 0.5) / Math.pow(2, z)) * 2. - 1, y: (1. - (y + 0.5) / Math.pow(2, z)) * 2. - 1. },
                scale: 1 / Math.pow(2, z),
                geom: points,
                properties: {},
            };
            Object.keys(fieldMap).map((name, pid) => {
                dataframe.properties[name] = properties[pid];
            });
            dataframe.schema = new R.Schema(Object.keys(dataframe.properties), Object.keys(dataframe.properties).map(() => 'float'));
            // console.log(Object.keys(dataframe.properties), Object.keys(dataframe.properties).map(() => 'float'), dataframe.schema);
            completedTiles.push(dataframe);
            if (completedTiles.length == needToComplete) {
                oldtiles.forEach(t => renderer.removeDataframe(t));
                completedTiles.forEach(f => renderer.addDataframe(f).setStyle(style));
                oldtiles = completedTiles;
                styleWidth();
                styleColor();

                renderer.getMin(null, (result) => console.log(`${JSON.stringify(result)} computed!`));
            }
        };
        oReq.send(null);
    });


}

const DEG2RAD = Math.PI / 180;
const EARTH_RADIUS = 6378137;
const WM_EXT = EARTH_RADIUS * Math.PI * 2;
const TILE_SIZE = 256;
// Webmercator projection
function Wmxy(latLng) {
    let lat = latLng.lat * DEG2RAD;
    let lng = latLng.lng * DEG2RAD;
    let x = lng * EARTH_RADIUS;
    let y = Math.log(Math.tan(lat / 2 + Math.PI / 4)) * EARTH_RADIUS;
    return { x: x, y: y };
}

var mapboxgl = window.mapboxgl;
mapboxgl.accessToken = 'pk.eyJ1IjoiZG1hbnphbmFyZXMiLCJhIjoiY2o5cHRhOGg5NWdzbTJxcXltb2g2dmE5NyJ9.RVto4DnlLzQc26j9H0g9_A';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/dark-v9', // stylesheet location
    center: [2.17, 41.38], // starting position [lng, lat]
    zoom: 14, // starting zoom,
});
map.repaint = false;
function getZoom() {
    var b = map.getBounds();
    var c = map.getCenter();
    var nw = b.getNorthWest();
    var sw = b.getSouthWest();
    var z = (Wmxy(nw).y - Wmxy(sw).y) / 40075019.834677525;
    renderer.setCenter(c.lng / 180., Wmxy(c).y / 40075019.834677525 * 2.);
    return z;
}

map.on('load', _ => {
    var cont = map.getCanvasContainer();
    var canvas = document.createElement('canvas')
    canvas.id = 'good';
    cont.appendChild(canvas)
    canvas.style.width = map.getCanvas().style.width;
    canvas.style.height = map.getCanvas().style.height;

    function move() {
        var b = map.getBounds();
        var nw = b.getNorthWest();
        var c = map.getCenter();

        renderer.setCenter(c.lng / 180., Wmxy(c).y / 40075019.834677525 * 2.);
        renderer.setZoom(getZoom());

        c = renderer.getCenter();
        var z = renderer.getZoom();
    }
    function moveEnd() {
        move();
        getData(canvas.clientWidth / canvas.clientHeight);
    };
    function resize() {
        canvas.style.width = map.getCanvas().style.width;
        canvas.style.height = map.getCanvas().style.height;
        move();
    }

    renderer = new R.Renderer(canvas);
    schema = new R.Schema(['category', 'amount'], ['float', 'float']);
    style = new R.Style.Style(renderer, schema);
    $('#widthStyleEntry').on('input', styleWidth);
    $('#colorStyleEntry').on('input', styleColor);
    resize();
    moveEnd();

    map.on('resize', resize);
    map.on('movestart', move);
    map.on('move', move);
    map.on('moveend', moveEnd);
});
