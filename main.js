"use strict";

var renderer;
var layer;
var oldtile;
var ajax;

function styleWidth(e) {
    const v = document.getElementById("widthStyleEntry").value;
    const width = eval(v);
    if (width) {
        layer.style.getWidth().blendTo(width, 1000);
    }
}
function styleColor(e) {
    const v = document.getElementById("colorStyleEntry").value;
    const color = eval(v);
    if (color) {
        layer.style.getColor().blendTo(color, 1000);
    }
}

function getData(){
    if (ajax){
        ajax.abort();
    }
    ajax = $.getJSON("https://dmanzanares.carto.com/api/v2/sql?q=" + encodeURIComponent(document.getElementById("sqlEntry").value) + "&api_key=d9d686df65842a8fddbd186711255ce5d19aa9b8", function (data) {
        if (oldtile){
            layer.removeTile(oldtile);
        }
        console.log("Downloaded", data);
        const fields = Object.keys(data.fields).filter(name => name != 'st_asgeojson');
        var properties = fields.map(_ => new Float32Array(data.rows.length));
        var points = new Float32Array(data.rows.length * 2);
        data.rows.forEach((e, index) => {
            var point = $.parseJSON(e.st_asgeojson).coordinates;
            points[2 * index + 0] = (point[0]) + Math.random() * 1000;
            points[2 * index + 1] = (point[1]) + Math.random() * 1000;
            fields.map((name, pid) => {
                properties[pid][index] = Number(e[name]);
            });
        });
        var tile = {
            center: { x: 0, y: 0 },
            scale: 1 / 10000000.,
            count: data.rows.length,
            geom: points,
            properties: {}
        };
        fields.map((name, pid) => {
            tile.properties[name] = properties[pid];
        })
        console.log("Tile", tile);
        oldtile=layer.addTile(tile);
        styleWidth();
        styleColor();
    });
}
function start() {
    renderer = new Renderer(document.getElementById('glCanvas'));
    layer = renderer.addLayer();

    getData();
    $('#widthStyleEntry').on('input', styleWidth);
    $('#colorStyleEntry').on('input', styleColor);
    $('#sqlEntry').on('input', getData);

    // Pan and zoom
    window.onresize = function () { renderer.refresh(); };
    $(window).bind('mousewheel DOMMouseScroll', function (event) {
        if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
            renderer.setZoom(renderer.getZoom() * 0.8);
        } else {
            renderer.setZoom(renderer.getZoom() / 0.8);
        }
    });
    var isDragging = false;
    var draggOffset = {
        x: 0.,
        y: 0.
    };
    document.onmousedown = function (event) {
        isDragging = true;
        draggOffset = {
            x: event.clientX,
            y: event.clientY
        };
    };
    document.onmousemove = function (event) {
        if (isDragging) {
            var c = renderer.getCenter();
            var k = renderer.getZoom() / document.body.clientHeight * 2.;
            c.x += (draggOffset.x - event.clientX) * k;
            c.y += -(draggOffset.y - event.clientY) * k;
            renderer.setCenter(c.x, c.y);
            draggOffset = {
                x: event.clientX,
                y: event.clientY
            };
        }
    };
    document.onmouseup = function () {
        isDragging = false;
    };
}
