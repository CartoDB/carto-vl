"use strict";

function start() {
    var renderer = new Renderer(document.getElementById('glCanvas'));
    var layer = renderer.addLayer();
    $.getJSON("https://dmanzanares.carto.com:443/api/v2/sql?q=" + encodeURIComponent("SELECT ST_AsGeoJSON(the_geom_webmercator), latin_species FROM sf_trees"), function (data) {
        console.log("Downloaded", data);
        console.log("Rows:", data.rows.length);
        var points = new Float32Array(data.rows.length * 2);
        var property0 = new Float32Array(data.rows.length);
        data.rows.forEach((e, index) => {
            var point = $.parseJSON(e.st_asgeojson).coordinates;
            points[2 * index + 0] = (point[0] + 13631285) / 10000.;
            points[2 * index + 1] = (point[1] - 4540319.5) / 10000.;
            property0[index] = e.latin_species.hashCode();
        });
        var features = {
            count: data.rows.length,
            geom: points,
            properties: {
                latin_species: property0
            }
        };
        layer.setTile({ x: 0, y: 0, z: 0 }, features);
        renderer.refresh();
    });

    window.onresize = function () { renderer.refresh(); };
    $(window).bind('mousewheel DOMMouseScroll', function (event) {
        if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
            renderer.zoom *= 0.8;
        } else {
            renderer.zoom /= 0.8;
        }
        renderer.refresh();
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
            var k = renderer.zoom / document.body.clientHeight * 2.;
            renderer.center.x += (draggOffset.x - event.clientX) * k;
            renderer.center.y += -(draggOffset.y - event.clientY) * k;
            draggOffset = {
                x: event.clientX,
                y: event.clientY
            };
            renderer.refresh();
        }
    };
    document.onkeypress = function (event) {
        //layer.style.color.blendTo([Math.random(), Math.random(), Math.random(), 1], 200);
        layer.style.color = new DiscreteRampColor('latin_species',
            ['Metrosideros excelsa', 'Ficus nitida', `Arbutus 'Marina`],
            [[0, 0, 0, 1], [1, 1, 1, 1], [0, 0, 1, 1]], [1, 0, 0, 1]);
        layer.style.width.blendTo(8. * Math.random(), 400);
        layer._compileTransformShader();
        renderer.refresh();
    }
    document.onmouseup = function () {
        isDragging = false;
    };
}
