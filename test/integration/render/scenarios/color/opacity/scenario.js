const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['line-string']);
const style = new carto.Style('color: opacity(cielab(87.73, -86.18, 83.18), 0.5)');
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
