const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['point']);
const style = new carto.Style('color: hsva(0.59, 0.89, 1.0, 0.5)');
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
