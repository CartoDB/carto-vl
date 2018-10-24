const map = new mapboxgl.Map({
    container: 'map',
    style: 'http://localhost:5000/test/common/basemaps/dark-matter-gl-style.json',
    center: [-74, 40.7],
    zoom: 12
});

carto.setDefaultAuth({
    username: 'localhost',
    apiKey: '1234'
});
carto.setDefaultConfig({
    serverURL: 'http://127.0.0.1:8181/user/{user}'
});
const source = new carto.source.Dataset('mnmappluto');
const viz = new carto.Viz(`
    color: ramp(linear($numfloors), prism)
    strokeWidth: 0
    @aux: ramp(viewportQuantiles($numfloors, 8), prism)
`);
const layer = new carto.Layer('myCartoLayer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
