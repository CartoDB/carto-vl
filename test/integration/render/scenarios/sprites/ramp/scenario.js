const map = new carto.Map({
    container: 'map',
    background: 'white'
});

const source = new carto.source.GeoJSON(sources['points']);
const viz = new carto.Viz(`
width: 50
color: ramp(linear($numeric), prism)
symbol: ramp(buckets($numeric, [4]), images([image('/test/common/marker.svg'), image('/test/common/marker2.svg')]))
symbolPlacement: align_center
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
