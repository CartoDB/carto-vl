const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['polygon']);
const viz = new carto.Viz(`
    color: red
    strokeColor: green
    strokeWidth: 3
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
