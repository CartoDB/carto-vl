import * as MGL from '../contrib/mapboxgl';

var mapboxgl = window.mapboxgl;
mapboxgl.accessToken = 'pk.eyJ1IjoiZG1hbnphbmFyZXMiLCJhIjoiY2o5cHRhOGg5NWdzbTJxcXltb2g2dmE5NyJ9.RVto4DnlLzQc26j9H0g9_A';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', // stylesheet location
    center: [2.17, 41.38], // starting position [lng, lat]
    zoom: 0, // starting zoom,
});
map.repaint = false;
var mgl = new MGL.MGLIntegrator(map);

$('#barcelona').click(() => {
    $('.step').css('display', 'inline');
    $('#styleEntry').removeClass('twelve columns').addClass('eight columns');
    document.getElementById("styleEntry").value = 'width:    40*(($amount/max($amount))^0.5) * (zoom()/10000 + 0.01)\ncolor:    ramp($category, Prism)';
    mgl.provider.setQueries(...mgl.barcelona());
    mgl.provider.getSchema().then(schema => {
        mgl.schema = schema;
        mgl.updateStyle();
    });
});

$('#wwi').click(() => {
    $('.step').css('display', 'none');
    $('#styleEntry').removeClass('eight columns').addClass('twelve columns');
    document.getElementById("styleEntry").value = 'width:    blend(1,2,near($day, (25*now()) %1000, 0, 10), cubic) *zoom()\ncolor:    setopacity(ramp($temp, tealrose, 0, 30), blend(0.005,1,near($day, (25*now()) %1000, 0, 10), cubic))';
    mgl.provider.setQueries(...mgl.ships_WWI());
    mgl.provider.getSchema().then(schema => {
        mgl.schema = schema;
        mgl.updateStyle();
    });
});

$('.step').css('display', 'none');
$('#styleEntry').removeClass('eight columns').addClass('twelve columns');


const styles = [
    `width: 3
color: rgba(0.8,0,0,1)`,

    `width: 3
color: rgba(0.8,0,0,0.2)`,

    `width: 3
color: hsv(0, 0, 1)`,

    `width: 3
color: hsv(0, 0.7, 1.)`,

    `width: 3
color: hsv(0.2, 0.7, 1.)`,

    `width: 3
color: hsv(0.7, 0.7, 1.)`,

    `width: 3
color: hsv($category/10, 0.7, 1.)`,

    `width: 3
color: ramp($category, Prism)`,

    `width: 3
color: ramp(top($category, 4), Prism)`,

    `width: 3
color: setOpacity( ramp($category, Prism), $amount/max($amount))`,

    `width: 3
color: ramp($category, Prism)`,

    `width: sqrt($amount/50000)*20
color: ramp($category, Prism)`,

    `width: sqrt($amount/50000)*20*(zoom()/4000+0.01)*1.5
color: ramp($category, Prism)`,
];
const texts = [];

let index = -1;

$('#prev').click(() => {
    if (index > 0) {
        index--;
        mgl.setStyle(styles[index]);
    }
});
$('#next').click(() => {
    if (index < styles.length - 1) {
        index++;
        mgl.setStyle(styles[index]);
    }
});

/*
var map2 = new mapboxgl.Map({
    container: 'map2', // container id
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', // stylesheet location
    center: [2.17, 41.38], // starting position [lng, lat]
    zoom: 14, // starting zoom,
});
var mgl2 = new MGL.MGLIntegrator(map2);
*/