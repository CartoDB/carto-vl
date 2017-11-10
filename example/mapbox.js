import * as R from '../src/index';

var VectorTile = require('@mapbox/vector-tile').VectorTile;
var Protobuf = require('pbf');

var renderer;
var layer;
var oldtile;
var ajax;

function styleWidth(e) {
    const v = document.getElementById("widthStyleEntry").value;
    try {
        layer.style.getWidth().blendTo(R.Style.parseStyleExpression(v), 1000);
    } catch (error) {
        console.warn(`Invalid width expression: ${error}`);
    }
}
function styleColor(e) {
    const v = document.getElementById("colorStyleEntry").value;
    try {
        layer.style.getColor().blendTo(R.Style.parseStyleExpression(v), 1000);
    } catch (error) {
        console.warn(`Invalid color expression: ${error}`);
    }
}

function getData() {
    if (ajax) {
        ajax.abort();
    }

    var oReq = new XMLHttpRequest();
    oReq.open("GET", "https://dmanzanares.carto.com/api/v1/map/dmanzanares@789cad67@92456f0655aac0322b2572f4e05088e7:1509358508954/mapnik/0/0/0.mvt", true);
    oReq.responseType = "arraybuffer";
    oReq.onload = function (oEvent) {
        var arrayBuffer = oReq.response;
        if (arrayBuffer) {
            var tile = new VectorTile(new Protobuf(arrayBuffer));
            const mvtLayer = tile.layers[Object.keys(tile.layers)[0]];

            var fieldMap = {
                temp: 0,
                daten: 1
            };
            //mvtLayer.length=1000;
            var properties = [[new Float32Array(mvtLayer.length)], [new Float32Array(mvtLayer.length)]];
            var points = new Float32Array(mvtLayer.length * 2);
            for (var i = 0; i < mvtLayer.length; i++) {
                const f = mvtLayer.feature(i);
                const geom = f.loadGeometry();
                points[2 * i + 0] = 2 * (geom[0][0].x) / 4096.0 - 1.;
                points[2 * i + 1] = 2 * (1. - (geom[0][0].y) / 4096.0) - 1.;

                properties[0][i] = Number(f.properties.temp);
                properties[1][i] = Number(f.properties.daten);
            }
            var tile = {
                center: { x: 0, y: 0 },
                scale: 1 / 1.,
                count: mvtLayer.length,
                geom: points,
                properties: {}
            };
            Object.keys(fieldMap).map((name, pid) => {
                tile.properties[name] = properties[pid];
            })
            oldtile = layer.addTile(tile);
            styleWidth();
            styleColor();
        }
    };

    oReq.send(null);
}
function start(element) {
    renderer = new R.Renderer(element);
    layer = renderer.addLayer();

    getData();
    $('#widthStyleEntry').on('input', styleWidth);
    $('#colorStyleEntry').on('input', styleColor);
    //$('#sqlEntry').on('input', getData);

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
    style: 'mapbox://styles/mapbox/basic-v9', // stylesheet location
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
    }
    start(canvas);
    move();
    map.on('movestart', move);
    map.on('move', move);
    map.on('moveend', move);
    map.on('dragstart', move);
    map.on('drag', move);
    map.on('dragstart', move);
    map.on('dragend', move);
    map.on('zoomstart', move);
    map.on('zoom', move);
    map.on('zoomend', move);

});
