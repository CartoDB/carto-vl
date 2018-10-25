const map = new CartoMap({
    container: 'map',
    background: 'white'
});

const source = new carto.source.GeoJSON(sources['points']);
const viz = new carto.Viz(`
    @animation: animation($numeric, 10, fade(5, 5))
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
    // Based on the fade options it will display:
    //  - Second point still fading out.
    //  - Third point still fading in.
    viz.variables.animation.setTimestamp(7.5);
});
