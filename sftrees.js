"use strict";

var map = {};

function start() {
    var renderer = new Renderer(document.getElementById('glCanvas'));
    var layer = renderer.addLayer();

    var autoinc = 5;
    //WHERE latin_species LIKE 'Platanus x hispanica'
    // AND ((latin_species LIKE 'Platanus x hispanica') OR (LOWER(latin_species) LIKE 'metrosideros excelsa') OR (latin_species LIKE 'lophostemon confertus'))
    //  $.getJSON("http://viz2.carto.com/api/v1/sql?q=" + encodeURIComponent("SELECT ST_AsGeoJSON(the_geom_webmercator), temp, DATE_PART('day', date::timestamp-'1912-12-31 01:00:00'::timestamp ) AS diff FROM ow  WHERE the_geom_webmercator IS NOT NULL  LIMIT 1000000"), function (data) {
    $.getJSON("https://dmanzanares.carto.com:443/api/v2/sql?q=" + encodeURIComponent("SELECT ST_AsGeoJSON(the_geom_webmercator), latin_species FROM sf_trees  WHERE the_geom_webmercator IS NOT NULL  LIMIT 1000000"), function (data) {
        console.log("Downloaded", data);
        var points = new Float32Array(data.rows.length * 2);
        var property0 = [];
        var property1 = new Float32Array(data.rows.length);
        var i = 0;
        data.rows.forEach((e, index) => {
            var point = $.parseJSON(e.st_asgeojson).coordinates;
            points[2 * index + 0] = (point[0]);
            points[2 * index + 1] = (point[1]);
            property0[index] = (e.latin_species.toLowerCase());
            //property1[index] = Number(e.diff);
        });
        var tile = {
            center: { x: 0, y: 0 },
            scale: 1 / 10000000.,
            count: data.rows.length,
            geom: points,
            properties: {
                'zero': property0,
                //'one': property1
            }
        };
        layer.addTile(tile);
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
    layer.style.getColor().blendTo(new ContinuousRampColor('p0', 0, 35, ['#3d5941', '#778868', '#b5b991', '#f6edbd', '#edbb8a', '#de8a5a', '#ca562c']), 1000);
    layer.style.getWidth().blendTo(3., 1000);

    document.onkeypress = function (event) {
        const ramp = new DiscreteRampColor('zero',
            ["Lophostemon confertus", "Platanus x hispanica", "Metrosideros excelsa"].map(str => {
                return str.toLowerCase();
            }),
            [[1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1]], [0.3, 0.3, 0.3, 1]);
        const yellow = new UniformColor([1, 1, 0, 1]);
        const red = new UniformColor([1, 0, 0, 1]);
        layer.style.setColor(new ColorBlend(yellow, ramp, "500ms"));
        if (Math.random() > 0.5) {
            //layer.style.getColor().blendTo(ramp, 1000);
            //layer.style.getColor().blendTo(new ContinuousRampColor('p0', 0, 35, ['#3d5941', '#778868', '#b5b991', '#f6edbd', '#edbb8a', '#de8a5a', '#ca562c']), 1000);
        } else {
            //layer.style.getColor().blendTo(new UniformColor([Math.random(), Math.random(), Math.random(), 0.4]), 1000);
            //layer.style.getColor().blendTo(new ContinuousRampColor('p0', 0, 35, ['#009392', '#39b185', '#9ccb86', '#e9e29c', '#eeb479', '#e88471', '#cf597e']), 1000);
        }
        //        layer.style.getWidth().center=Math.random()*4000.;
        //layer.style.getWidth().notify();
        layer.style.getWidth().blendTo(0. + 1. * 15. * Math.random(), 1000);
        //layer.style.getWidth().blendTo(8. * Math.random(), 1400);
    }
    document.onmouseup = function () {
        isDragging = false;
    };
}
