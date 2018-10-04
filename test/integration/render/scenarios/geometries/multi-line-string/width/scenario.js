const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['multi-line-string']);
const viz = new carto.Viz('width: 30');
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
