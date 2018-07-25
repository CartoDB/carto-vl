const map = new mapboxgl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [-122.42, 37.77],
    zoom: 12
});

carto.setDefaultAuth({
    user: 'localhost',
    apiKey: '1234'
});
carto.setDefaultConfig({
    serverURL: 'http://{user}.localhost.lan:8181'
});

const source = new carto.source.Dataset('sf_stclines');
const s = carto.expressions;
const viz = new carto.Viz({
    width: 3,
    color: s.hsv(0.2, 1, 0.9)
});
const layer = new carto.Layer('myCartoLayer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
