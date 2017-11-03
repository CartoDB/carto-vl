"use strict";

var renderer;
var layer;

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
function start() {
    renderer = new Renderer(document.getElementById('glCanvas'));
    layer = renderer.addLayer();
    $.getJSON("https://dmanzanares.carto.com/api/v2/sql?q=" + encodeURIComponent("SELECT ST_AsGeoJSON(the_geom_webmercator), temp, DATE_PART('day', date::timestamp-'1912-12-31 01:00:00'::timestamp ) AS diff FROM wwi_ships  WHERE the_geom_webmercator IS NOT NULL  LIMIT 10000000") + "&api_key=d9d686df65842a8fddbd186711255ce5d19aa9b8", function (data) {
        console.log("Downloaded", data);
        var points = new Float32Array(data.rows.length * 2);
        var property0 = new Float32Array(data.rows.length);
        var property1 = new Float32Array(data.rows.length);
        var i = 0;
        data.rows.forEach((e, index) => {
            var point = $.parseJSON(e.st_asgeojson).coordinates;
            points[2 * index + 0] = (point[0]) + Math.random() * 1000;
            points[2 * index + 1] = (point[1]) + Math.random() * 1000;
            property0[index] = Number(e.temp);
            property1[index] = Number(e.diff);
        });
        var tile = {
            center: { x: 0, y: 0 },
            scale: 1 / 10000000.,
            count: data.rows.length,
            geom: points,
            properties: {
                'temp': property0,
                'date': property1
            }
        };
        console.log("Tile", tile);
        layer.addTile(tile);
        styleWidth();
        styleColor();
    });
    $('#widthStyleEntry').on('input', styleWidth);
    $('#colorStyleEntry').on('input', styleColor);

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
