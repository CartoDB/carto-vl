const map = new CartoMap({
    container: 'map',
    background: 'white'
});

const source = new carto.source.GeoJSON(sources['point']);
const viz = new carto.Viz(`
    width: 48
    color: blue
    strokeWidth: 4
    strokeColor: orange
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
