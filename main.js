"use strict";

var map = {};

function start() {
    var renderer = new Renderer(document.getElementById('glCanvas'));
    var layer = renderer.addLayer();

    var autoinc = 5;
//WHERE latin_species LIKE 'Platanus x hispanica'
// AND ((latin_species LIKE 'Platanus x hispanica') OR (LOWER(latin_species) LIKE 'metrosideros excelsa') OR (latin_species LIKE 'lophostemon confertus'))
    $.getJSON("https://dmanzanares.carto.com:443/api/v2/sql?q=" + encodeURIComponent("SELECT ST_AsGeoJSON(the_geom_webmercator), latin_species FROM sf_trees  WHERE the_geom_webmercator IS NOT NULL  LIMIT 1000000"), function (data) {
        console.log("Downloaded", data);
        var points = new Float32Array(data.rows.length * 2);
        var property0 = new Float32Array(data.rows.length);
        var i=0;
        data.rows.forEach((e, index) => {
            var point = $.parseJSON(e.st_asgeojson).coordinates;
            if (map[e.latin_species.toLowerCase()] === undefined) {
                map[e.latin_species.toLowerCase()] = autoinc;
                autoinc++;
            }
            points[2 * index + 0] = (point[0] + 13631285) / 10000.;
            points[2 * index + 1] = (point[1] - 4540319.5) / 10000.;
            property0[index] = map[e.latin_species.toLowerCase()];
        });
        var features = {
            count: data.rows.length,
            geom: points,
            properties: {
                latin_species: property0
            }
        };
        layer.setTile({ x: 0, y: 0, z: 0 }, features);
    });

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
    document.onkeypress = function (event) {
        const ramp = new DiscreteRampColor('latin_species',
            ["Lophostemon confertus", "Platanus x hispanica", "Metrosideros excelsa"].map(str => {
                return map[str.toLowerCase()];
            }),
            [[1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1]], [0, 0, 0, 1]);
        const yellow = new UniformColor([1, 1, 0, 1]);
        const red = new UniformColor([1, 0, 0, 1]);
        layer.style.setColor(new ColorBlend(yellow, ramp, "500ms"));
        layer.style.getWidth().blendTo(8. * Math.random(), 1400);
    }
    document.onmouseup = function () {
        isDragging = false;
    };
}
