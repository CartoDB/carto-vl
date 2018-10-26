const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source1 = new carto.source.GeoJSON(sources['points']);
const layer = new carto.Layer('layer', source1, new carto.Viz());

layer.addTo(map);
layer.on('loaded', async () => {
    await layer.blendToViz(new carto.Viz('color: green'), 60);
    await sleep(60);
    window.loaded = true;
});

function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
