const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['point']);
const style = new carto.Style(`
    strokeWidth: 2
    strokeColor: rgba(1, 0, 0, 1)
`);
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
