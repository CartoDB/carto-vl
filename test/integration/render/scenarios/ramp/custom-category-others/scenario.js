const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['points']);
const viz = new carto.Viz(`
    color: ramp(buckets($cat, ['0', '1']), [hsv(0,1,1), hsv(0.5,1,1)], hsv(0,0,0.3))
    width: 50`
);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
