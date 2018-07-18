const map = new mapboxgl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [-74, 40.7],
    zoom: 12
});

carto.setDefaultAuth({
    user: 'localhost',
    apiKey: '1234'
});
carto.setDefaultConfig({
    serverURL: 'http://{user}.localhost.lan:8181'
});
const source = new carto.source.Dataset('mnmappluto');
const viz = new carto.Viz(`
    color: ramp(linear($numfloors), prism)
    strokeWidth: 0
`);
const layer = new carto.Layer('myCartoLayer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
