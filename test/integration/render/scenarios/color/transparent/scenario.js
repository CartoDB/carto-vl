const map = new CartoMap({
    container: 'map'
});

const source = new carto.source.GeoJSON(sources['point']);
const viz = new carto.Viz(`
    color: transparent
    strokeColor: red
    strokeWidth: 4
    width: 40
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
