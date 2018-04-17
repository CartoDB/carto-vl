const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['point']);
const viz = new carto.Viz(`
    color: rgb(255, 0, 0)
    width: 50
    strokeWidth: 20
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
