const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source1 = new carto.source.GeoJSON(sources['points']);
const layer = new carto.Layer('layer', source1, new carto.Viz());

const source2 = new carto.source.GeoJSON(sources['polygon']);

layer.addTo(map);
layer.on('loaded', async () => {
    await layer.update(source2, new carto.Viz());
    window.loaded = true;
});
