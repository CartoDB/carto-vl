const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['line-string']);
const style = new carto.Style('color: hex("#F00")');
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
