const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['points']);
const viz = new carto.Viz(`
    color: red
    @v_features: viewportFeatures($numeric, $cat)
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);

layer.on('loaded', async () => {
    const feature = viz.variables.v_features.value[0];

    await feature.color.blendTo('blue', feature.numeric);
    await feature.width.blendTo(20, 10);

    window.loaded = true;
});
