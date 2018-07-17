const map = new carto.Map({
    container: 'map',
    background: 'black',
    center: [-75, 40],
    zoom: 5
});

carto.setDefaultAuth({
    user: 'cartovl',
    apiKey: 'default_public'
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
