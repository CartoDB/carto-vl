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
    mgl.setStyle(styles[index]);
    $('#tutorial').text(texts[index]);
    mgl.provider.setQueries(...mgl.barcelona());
    mgl.provider.getSchema().then(schema => {
        mgl.schema = schema;
        mgl.updateStyle();
    });
});

$('#wwi').click(() => {
    $('.step').css('display', 'none');
    $('#styleEntry').removeClass('eight columns').addClass('twelve columns');
    $('#tutorial').text('');
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
const texts = [
    `We can use RGBA colors`,

    `This means that we can change the opacity (alpha) easily`,

    `There is support for other color spaces like HSV (Hue, Saturation, Value)`,

    `Hue, Saturation and Value are defined in the [0,1] range, the hue is wrapped (cylindrical space)`,
    `Hue, Saturation and Value are defined in the [0,1] range, the hue is wrapped (cylindrical space)`,
    `Hue, Saturation and Value are defined in the [0,1] range, the hue is wrapped (cylindrical space)`,

    `You can mix expressions. Here we are setting the hue based on the category of each feature`,

    `We can use turbo-carto inspired ramps too`,

    `We can select the top categories, by grouping the rest into the 'others' buckets`,

    `We can normalize the map based on the amount property by changing the opacity`,

    `But, let's go back a little bit...`,

    `We can create a bubble map easily, and we can use the square root to make the circle's area proportional to the feature's property`,

    `We can make them proportional to the scale too, to avoid not very attractive overlaps`,
];

let index = 0;

$('#prev').click(() => {
    $("#prev").attr("disabled",false);
    $("#next").attr("disabled",false);
    if (index > 0) {
        index--;
        mgl.setStyle(styles[index]);
        $('#tutorial').text(texts[index]);
    }
    if (index == 0) {
        $("#prev").attr("disabled",true);
    }
});
$('#next').click(() => {
    $("#prev").attr("disabled",false);
    $("#next").attr("disabled",false);
    if (index < styles.length - 1) {
        index++;
        mgl.setStyle(styles[index]);
        $('#tutorial').text(texts[index]);
    }
    if (index == styles.length - 1) {
        $("#next").prop("disabled", true);
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