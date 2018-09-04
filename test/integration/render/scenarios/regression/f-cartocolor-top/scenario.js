const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['points3']);
const viz = new carto.Viz('color: ramp(top($cat, @num), PRISM), width: 10, @num: 2');
const layer = new carto.Layer('layer', source, viz);

viz.variables.num.blendTo(1, 0);
layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
