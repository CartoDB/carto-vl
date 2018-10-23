const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source1 = new carto.source.GeoJSON(sources['points']);
const layer = new carto.Layer('layer', source1, new carto.Viz());

layer.addTo(map);
layer.on('loaded', async () => {
    // TODO
    await layer.update(source1, new carto.Viz('color: green'));
    // Slow down source (setTimeout monkey patch) by 100 ms ?

    try {
        await layer.viz.color.blendTo('red', 300);
        window.loaded = true;
    } catch (e) {
        // The blendTo should be rejected by `update` override
        window.loaded = true;
    }
});
