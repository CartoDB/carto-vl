const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['point']);
const style = new carto.Style(`
    color: rgba(1, 0, 0, 1)
    width: 50
    strokeWidth: 20
`);
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
