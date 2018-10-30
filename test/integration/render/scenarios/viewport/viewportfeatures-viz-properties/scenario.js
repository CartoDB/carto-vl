const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['points']);
const viz = new carto.Viz(`
    color: red
    @v_features: viewportFeatures($numeric, $cat)
    @augmentedSize: 20
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);

layer.on('loaded', async () => {
    const feature = viz.variables.v_features.value[0];

    // Using viz properties, viz variables (and also feature props)
    const duration = feature.properties.numeric;
    const augmentedSize = feature.variables.augmentedSize.value;

    layer.on('updated', debounce(() => { window.loaded = true; }));
    await feature.blendTo({
        color: 'blue',
        width: augmentedSize * 2.0
    }, duration);
});

const debounce = (func, delay = 250) => {
    let timeoutId;
    return function () {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
    };
};
