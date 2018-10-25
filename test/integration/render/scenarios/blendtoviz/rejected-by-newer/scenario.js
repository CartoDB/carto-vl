const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['points']);
source._clone = () => source;
source.requiresNewMetadata = () => true;

const layer = new carto.Layer('layer', source, new carto.Viz());

layer.addTo(map);
layer.on('loaded', async () => {
    try {
        let id = 0;
        const oriRequestMetadata = source.requestMetadata.bind(source);
        source.requestMetadata = async (...args) => {
            id++;
            await sleep(id - 1 === 0 ? 60 : 0);
            return oriRequestMetadata(...args);
        };

        const blendtoviz1 = layer.blendToViz(new carto.Viz('color: yellow'));

        // Avoid slow-down to make the second blendToViz faster
        layer.blendToViz(new carto.Viz('color: green'));

        await blendtoviz1;
        throw new Error('blendtoviz1 should have been rejected');
    } catch (e) {
        // blendtoviz2 should override blendtoviz1 since it is newer => red points
        window.loaded = true;
    }
});

function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
