const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['points3']);
const viz = new carto.Viz(`
    color: ramp(top(@prop, @num), PRISM)
    width: 50
    @prop: $cat
    @num: 2
`);
const layer = new carto.Layer('layer', source, viz);

viz.variables.num.blendTo(2, 0);
layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
