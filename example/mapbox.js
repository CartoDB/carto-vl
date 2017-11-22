import * as R from '../src/index';

var VectorTile = require('@mapbox/vector-tile').VectorTile;
var Protobuf = require('pbf');

var renderer;
var layer;
var oldtiles = [];
var ajax;

var meta = {
    properties: {
        temp: true,
        daten: true
    }
};

function styleWidth(e) {
    // const v = document.getElementById("widthStyleEntry").value;
    const v = "blend(8, 8, near($daten, now(0.01), 0, 0.01))  ";
    try {
        layer.style.getWidth().blendTo(R.Style.parseStyleExpression(v, meta), 1000);
        document.getElementById("feedback").value = 'ok';
    } catch (error) {
        const err = `Invalid width expression: ${error}:${error.stack}`;
        console.warn(err);
        document.getElementById("feedback").value = err;
    }
}
function styleColor(e) {
    // const v = document.getElementById("colorStyleEntry").value;
    const v = "rampColor($temp, 0, 1, tealrose)";
    try {
        layer.style.getColor().blendTo(R.Style.parseStyleExpression(v, meta), 1000);
        document.getElementById("feedback").value = 'ok';
    } catch (error) {
        const err = `Invalid color expression: ${error}:${error.stack}`;
        console.warn(err);
        document.getElementById("feedback").value = err;
    }
}

/*
TODO
    SQL API
    Tiling (copy query from Windshaft - MVT) & center&scale
    St_AsMVT
    Metadata with SQL API
    Agg
*/


function getTile(c, z) {
    var z = Math.round(Math.log2(1. / z) - 2);
    var x = c.x * 0.5 + 0.5;
    var y = 1. - (c.y * 0.5 + 0.5);
    console.log(x, y, z);
    return {
        x: Math.floor(Math.pow(2, z) * x),
        y: Math.floor(Math.pow(2, z) * y),
        z: z,
    };
}
function getTileList(c, iz) {
    var list = [];
    var z = Math.ceil(Math.log2(1. / iz));
    var x = c.x;
    var y = c.y;
    const numTiles = Math.pow(2, z);
    function saturate(x) {
        return Math.min(Math.max(x, 0), 1);
    }
    const minx = Math.floor(numTiles * saturate((x - iz) * 0.5 + 0.5));
    const maxx = Math.ceil(numTiles * saturate((x + iz) * 0.5 + 0.5));
    const miny = Math.floor(numTiles * saturate(1. - ((y + iz) * 0.5 + 0.5)));
    const maxy = Math.ceil(numTiles * saturate(1. - ((y - iz) * 0.5 + 0.5)));
    console.log("MM", minx, maxx, miny, maxy)
    for (let i = minx; i < maxx; i++) {
        for (let j = miny; j < maxy; j++) {
            list.push({
                x: i,
                y: j,
                z: z
            });
        }
    }
    //console.log(x, y, z, iz);
    console.log(list)
    return list;
}
var numpoints = 0;
function getData() {
    const tiles = getTileList(renderer.getCenter(), renderer.getZoom());
    var completedTiles = [];
    var needToComplete = tiles.length;
    tiles.forEach(t => {
        const x = t.x;
        const y = t.y;
        const z = t.z;
        const mvt_extent = 1024;
        const subpixelBufferSize = 0;
        const query =
            `(select st_asmvt(geom, 'lid') FROM
        (
            SELECT
                ST_AsMVTGeom(
                    ST_SetSRID(ST_MakePoint(avg(ST_X(the_geom_webmercator)), avg(ST_Y(the_geom_webmercator))),3857),
                    CDB_XYZ_Extent(${x},${y},${z}), ${mvt_extent}, ${subpixelBufferSize}, false
                )
            FROM tx_0125_copy_copy AS cdbq
            WHERE the_geom_webmercator && CDB_XYZ_Extent(${x},${y},${z})
            GROUP BY ST_SnapToGrid(the_geom_webmercator, CDB_XYZ_Resolution(${z})*3.)
        )AS geom
    )`;
        console.log(query);
        var oReq = new XMLHttpRequest();
        oReq.open("GET", "https://dmanzanares-core.carto.com/api/v2/sql?q=" + encodeURIComponent(query) + "&api_key=94221530e644bd478c662e5a402618b1ddd62704", true);
        oReq.onload = function (oEvent) {
            const json = JSON.parse(oReq.response);
            if (json.rows[0].st_asmvt.data.length == 0) {
                needToComplete--;
                return;
            }
            var tile = new VectorTile(new Protobuf(new Uint8Array(json.rows[0].st_asmvt.data)));
            //console.log(json, tile, json.rows[0].st_asmvt.data, Object.keys(tile.layers))
            const mvtLayer = tile.layers[Object.keys(tile.layers)[0]];
            numpoints += mvtLayer.length;
            //console.log("numpoints", numpoints);
            var fieldMap = {
                temp: 0,
                daten: 1
            };
            //mvtLayer.length=1000;
            var properties = [[new Float32Array(mvtLayer.length)], [new Float32Array(mvtLayer.length)]];
            var points = new Float32Array(mvtLayer.length * 2);
            const r = Math.random();
            for (var i = 0; i < mvtLayer.length; i++) {
                const f = mvtLayer.feature(i);
                const geom = f.loadGeometry();
                points[2 * i + 0] = 2 * (geom[0][0].x) / mvt_extent - 1.;
                points[2 * i + 1] = 2 * (1. - (geom[0][0].y) / mvt_extent) - 1.;

                // properties[0][i] = Number(f.properties.temp);
                // properties[1][i] = Number(f.properties.daten) / 4000.;
                properties[0][i] = Number(r);
                properties[1][i] = Number(Math.random());
            }

            var tile = {
                center: { x: ((x + 0.5) / Math.pow(2, z)) * 2. - 1, y: (1. - (y + 0.5) / Math.pow(2, z)) * 2. - 1. },
                scale: 1 / Math.pow(2, z),
                count: mvtLayer.length,
                geom: points,
                properties: {}
            };
            console.log(tile.center, tile.scale);

            Object.keys(fieldMap).map((name, pid) => {
                tile.properties[name] = properties[pid];
            })
            completedTiles.push(tile);
            if (completedTiles.length == needToComplete) {
                oldtiles.forEach(t => layer.removeTile(t));
                completedTiles.forEach(t => layer.addTile(t));
                oldtiles = completedTiles;
                styleWidth();
                styleColor();
            }
        };
        oReq.send(null);
    });
}
function start(element) {
    renderer = new R.Renderer(element);
    layer = renderer.addLayer();

    getData();
    $('#widthStyleEntry').on('input', styleWidth);
    $('#colorStyleEntry').on('input', styleColor);
    $('#sqlEntry').on('input', getData);

    //window.onresize = function () { renderer.refresh(); };
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
    style: 'mapbox://styles/dmanzanares/cj9qx712c0l7u2rpix0913d5g', // stylesheet location
    center: [-74.50, 40], // starting position [lng, lat]
    zoom: 0, // starting zoom,
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

    var isDragging = false;
    var draggOffset = {
        x: 0.,
        y: 0.
    };

    function move(a, b, c) {
        var b = map.getBounds();
        var nw = b.getNorthWest();
        var c = map.getCenter();

        renderer.setCenter(c.lng / 180., Wmxy(c).y / 40075019.834677525 * 2.);
        renderer.setZoom(getZoom());

        c = renderer.getCenter();
        var z = renderer.getZoom();
        // console.log(c, z, 1 / z, getTile(c, z));
    }
    start(canvas);
    move();
    const f = () => {
        move();
        //getTileList(renderer.getCenter(), renderer.getZoom());
        getData();
    };
    map.on('movestart', move);
    map.on('move', move);
    map.on('moveend', f);
    map.on('dragstart', move);
    map.on('drag', move);
    map.on('dragstart', move);
    map.on('dragend', f);
    map.on('zoomstart', move);
    map.on('zoom', move);
    map.on('zoomend', f);

});
