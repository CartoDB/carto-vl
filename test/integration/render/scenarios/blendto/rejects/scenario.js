const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source1 = new carto.source.GeoJSON(sources['points']);
const viz = new carto.Viz();
const layer = new carto.Layer('layer', source1, viz);

layer.addTo(map);
layer.on('loaded', async () => {
    try {
        await viz.color.blendTo('invalidColor', 60);
    } catch (error) {
        window.loaded = true;
    }
});
