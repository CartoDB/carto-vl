const map = new carto.Map({
    container: 'map',
    background: 'white'
});

const source = new carto.source.GeoJSON(sources['points']);
const viz = new carto.Viz(`
width: 50
color: ramp(linear($numeric), prism)
symbol: sprite('../../../../../common/marker.svg')
symbolPlacement: align_bottom
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
