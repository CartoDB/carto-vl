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
    @features: viewportFeatures($numfloors, $cartodb_id)
`);
const layer = new carto.Layer('myCartoLayer', source, viz);

layer.addTo(map);

layer.on('loaded', async () => {
    const actual = {};
    viz.variables.features.value.forEach(f => {
        actual[f.properties.cartodb_id] = {
            numfloors: f.properties.numfloors
        };
    });
    window.a = JSON.stringify(actual);

    // The fixture must be taken in the same viewport dimensions that the test is going to be executed under
    const fixture = await (await fetch('./fixture.json')).json();

    if (JSON.stringify(fixture) !== JSON.stringify(actual)) {
        throw new Error('viewportFeatures fixture didn\'t match');
    }

    window.loaded = true;
});
