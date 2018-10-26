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

layer.on('loaded', () => {
    const feature = viz.variables.v_features.value[0];

    // Using viz properties, viz variables (and also feature props)
    const duration = feature.numeric;
    const augmentedSize = feature.variables.augmentedSize.value;

    feature.color.blendTo('blue', duration);

    let updates = 0;
    const func = () => {
        if (updates === 0) {
            feature.width.blendTo(augmentedSize * 2, 10);
            updates++;
        } else {
            window.loaded = true;
        }
    };

    layer.on('updated', debounceSetLoaded(func));
});

const debounceSetLoaded = (func, delay = 250) => {
    let timeoutId;
    return function () {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
    };
};
