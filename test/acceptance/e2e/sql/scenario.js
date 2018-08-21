const map = new carto.Map({
    container: 'map',
    background: 'black'
});

carto.setDefaultAuth({
    user: 'localhost',
    apiKey: '1234'
});
carto.setDefaultConfig({
    serverURL: 'http://{user}.localhost.lan:8181'
});

const source = new carto.source.SQL(
    `
        SELECT
        1 as cartodb_id,
        ST_Transform(ST_SetSRID(ST_MakePoint(0, 0), 4326), 3857) as the_geom_webmercator
    `
);

const viz = new carto.Viz(`
    color: red
    width: 10
    strokeWidth: 0
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
