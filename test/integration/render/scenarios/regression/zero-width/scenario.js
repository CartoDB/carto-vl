const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['point']);
const viz = new carto.Viz(`
    color: red
    strokeColor: green
    width: -1
    strokeWidth: 10
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
