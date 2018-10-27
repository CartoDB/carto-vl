const map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [-74, 40.7],
    zoom: 12
});

carto.setDefaultAuth({
    user: 'localhost',
    apiKey: '1234'
});
carto.setDefaultConfig({
    serverURL: 'http://127.0.0.1:8181/user/{user}'
});
const source = new carto.source.Dataset('mnmappluto');
const viz = new carto.Viz(`
    color: red
    strokeWidth: 0
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', async function () {
    // This will create a new set of tiles as the numfloors
    // attribute was not present in the initial viz object.
    await viz.color.blendTo('ramp($numfloors, temps)', 0);
    layer.on('updated', debounceSetLoaded());
});
