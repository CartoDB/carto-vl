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
    const duration = feature.numeric;
    const augmentedSize = feature.variables.augmentedSize.value;

    await feature.color.blendTo('blue', duration);
    await feature.width.blendTo(augmentedSize, 10);

    window.loaded = true;
});
