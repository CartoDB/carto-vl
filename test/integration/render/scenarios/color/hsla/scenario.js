const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['line-string']);
const style = new carto.Style('color: hsla(0.7, 0.7, 0.5, 0.5)');
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
