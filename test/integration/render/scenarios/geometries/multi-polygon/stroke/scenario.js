const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['multi-polygon']);
const viz = new carto.Viz(`
    color: red
    strokeColor: green
    strokeWidth: 3
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
