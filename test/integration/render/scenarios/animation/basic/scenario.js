const map = new CartoMap({
    container: 'map',
    background: 'white'
});

const source = new carto.source.GeoJSON(sources['points']);
const viz = new carto.Viz(`
    @animation: animation($numeric)
    width: 48
    color: ramp(buckets($cat, ['0', '1', '2']), [red, green, blue])
    strokeWidth: 0
    filter: @animation
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    viz.variables.animation.pause();
    layer.on('updated', () => {
        window.loaded = true;
    });
    // This will display just the first point.
    // The first point will be at 100% opacity.
    viz.variables.animation.setTimestamp(0);
});
