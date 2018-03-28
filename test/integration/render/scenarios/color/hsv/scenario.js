const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['point']);
const style = new carto.Style('color: hsv(0.59, 0.89, 1.0)');
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
