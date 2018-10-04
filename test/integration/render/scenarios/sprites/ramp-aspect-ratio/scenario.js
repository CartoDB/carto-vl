const map = new CartoMap({
    container: 'map',
    background: 'white'
});

const source = new carto.source.GeoJSON(sources['points']);
const viz = new carto.Viz(`
width: 50
symbol: ramp(buckets($numeric, [4]), [image('/test/common/ellipse.svg'), image('/test/common/ellipse.svg')])
symbolPlacement: align_center
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
