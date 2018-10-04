const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['line-string']);
const viz = new carto.Viz('color: rgba(255, 0, 0, 0.5)');
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
