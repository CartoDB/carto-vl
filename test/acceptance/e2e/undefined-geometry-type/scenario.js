const map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [-74, 40.7],
    zoom: 12
});

carto.setDefaultAuth({
    username: 'localhost',
    apiKey: '1234'
});
carto.setDefaultConfig({
    serverURL: 'http://{user}.localhost.lan:8181'
});
const source = new carto.source.SQL('SELECT 1 cartodb_id, null::geometry the_geom_webmercator LIMIT 0');
const viz = new carto.Viz();
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
