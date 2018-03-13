const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['line-string']);
const style = new carto.Style('width: 100');
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
