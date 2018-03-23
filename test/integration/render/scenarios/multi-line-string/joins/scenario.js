const map = new carto.Map({
    container: 'map',
    background: 'white'
});

const source = new carto.source.GeoJSON(sources['line-joins']);
const style = new carto.Style('width: 20 color: rgba(0, 0, 0, 0.3)');
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
