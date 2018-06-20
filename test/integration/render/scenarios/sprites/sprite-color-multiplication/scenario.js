const map = new carto.Map({
    container: 'map',
    background: 'white'
});

const source = new carto.source.GeoJSON(sources['points']);
const viz = new carto.Viz(`
width: 50
symbol: red * sprite('/test/common/flower.svg')
symbolPlacement: align_bottom
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
