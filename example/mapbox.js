import * as R from '../src/index';
import * as sql_api from '../contrib/sql-api';
function getData() {
    sql_api.getData(renderer);
}

var renderer;
var style;

function styleWidth(e) {
    const v = document.getElementById("widthStyleEntry").value;
    try {
        style.getWidth().blendTo(R.Style.parseStyleExpression(v, sql_api.schema), 1000);
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
        style.getColor().blendTo(R.Style.parseStyleExpression(v, sql_api.schema), 1000);
        document.getElementById("feedback").value = 'ok';
    } catch (error) {
        const err = `Invalid color expression: ${error}:${error.stack}`;
        console.warn(err);
        document.getElementById("feedback").value = err;
    }
}


const DEG2RAD = Math.PI / 180;
const EARTH_RADIUS = 6378137;
const WM_R = EARTH_RADIUS * Math.PI; // Webmercator *radius*: half length Earth's circumference
const WM_2R = WM_R * 2; // Webmercator coordinate range (Earth's circumference)
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
    var z = (Wmxy(nw).y - Wmxy(sw).y) / WM_2R;
    renderer.setCenter(c.lng / 180., Wmxy(c).y / WM_R);
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

        renderer.setCenter(c.lng / 180., Wmxy(c).y / WM_R);
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
    style = new R.Style.Style(renderer, sql_api.schema);
    sql_api.init(style);
    $('#widthStyleEntry').on('input', styleWidth);
    $('#colorStyleEntry').on('input', styleColor);
    styleWidth();
    styleColor();
    resize();
    moveEnd();

    map.on('resize', resize);
    map.on('movestart', move);
    map.on('move', move);
    map.on('moveend', moveEnd);
});
