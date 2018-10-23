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
        const tmp = source1.requestMetadata;
        source1.requestMetadata = async () => {
            await sleep(100);
            return tmp;
        };
        const update1 = layer.update(source1, new carto.Viz('color: green'));
        // Slow down source (setTimeout monkey patch) by 100 ms ?

        const source2 = new carto.source.GeoJSON(sources['points']);
        const update2 = layer.update(source2, new carto.Viz('color: red'));

        await update1;
    } catch (e) {
        // Update 2 should override update1 since it is newer => red points
        window.loaded = true;
    }
});

function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
