const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source1 = new carto.source.GeoJSON(sources['points']);
const viz = new carto.Viz();
const layer = new carto.Layer('layer', source1, viz);

layer.addTo(map);
layer.on('loaded', async () => {
    await viz.color.blendTo('green', 60);
    await sleep(60);
    window.loaded = true;
});

function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
