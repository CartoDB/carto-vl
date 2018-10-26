const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source1 = new carto.source.GeoJSON(sources['points']);
const layer = new carto.Layer('layer', source1, new carto.Viz());

layer.addTo(map);
layer.on('loaded', async () => {
    await layer.update(source1, new carto.Viz('color: green'));
    window.loaded = true;
});
