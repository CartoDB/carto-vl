const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['point']);
const viz = new carto.Viz();
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
viz.color = carto.expressions.hsv(0.59, 0.89, 1.0);
layer.on('loaded', () => {
    window.loaded = true;
});
