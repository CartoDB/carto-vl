const map = new mapboxgl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [-122.42, 37.77],
    zoom: 12
});

carto.setDefaultAuth({
    user: 'cartogl',
    apiKey: 'YOUR_API_KEY'
});

const source = new carto.source.Dataset('sf_stclines');
const s = carto.style.expressions;
const style = new carto.Style({
    width: 3,
    color: s.hsv(0.2, 1, .9),
});
const layer = new carto.Layer('myCartoLayer', source, style);

layer.addTo(map);
