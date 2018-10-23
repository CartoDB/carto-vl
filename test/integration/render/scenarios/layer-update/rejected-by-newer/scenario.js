const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source0 = new carto.source.GeoJSON(sources['points']);
const layer = new carto.Layer('layer', source0, new carto.Viz());

layer.addTo(map);
layer.on('loaded', async () => {
    // TODO

    try {
        const source1 = new carto.source.GeoJSON(sources['points']);
        slowDown(source1, 60);

        const update1 = layer.update(source1, new carto.Viz('color: green'));

        const source2 = new carto.source.GeoJSON(sources['points']);
        layer.update(source2, new carto.Viz('color: red'));

        await update1;
        console.warn('Update1 should have been rejected');
    } catch (e) {
        // Update 2 should override update1 since it is newer => red points
        window.loaded = true;
    }
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
