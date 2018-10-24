const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source1 = new carto.source.GeoJSON(sources['points']);
const layer = new carto.Layer('layer', source1, new carto.Viz());

layer.addTo(map);
layer.on('loaded', async () => {
    slowDown(source1, 60);
    const updatePromise = layer.update(source1, new carto.Viz('color: green'));
    layer.viz.color.blendTo('red', 300);
    await updatePromise;

    // The blendTo should be overridden by `update`
    window.loaded = true;
});

function slowDown (source, ms) {
    const oriRequestMetadata = source.requestMetadata.bind(source);
    source._clone = () => source;
    let ok = false;
    source.requestMetadata = async (...args) => {
        await sleep(ms);
        ok = true;
        return oriRequestMetadata(...args);
    };
    const oriRequestData = source.requestData.bind(source);
    source.requestData = (...args) => {
        if (!ok) {
            return;
        }
        return oriRequestData(...args);
    };
    return source;
}

function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
