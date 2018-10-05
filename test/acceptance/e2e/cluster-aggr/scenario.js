const map = new CartoMap({
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

const source = new carto.source.Dataset('monarch_migration_1');
const viz = new carto.Viz(`
    @mn: clusterMin($number)
    @mx: clusterMax($number)
    @av: clusterAvg($number)
    width: log(@mx)*2,
    color: hsv(log(@mn)/10.5, 1, 1)
    strokeWidth: 0
    order: desc(width())
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
