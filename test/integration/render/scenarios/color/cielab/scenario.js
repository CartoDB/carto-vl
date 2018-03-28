const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['line-string']);
const style = new carto.Style('color: cielab(90, 10, 60)');
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
