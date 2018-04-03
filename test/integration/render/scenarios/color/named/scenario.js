const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['point']);
const style = new carto.Style('color: blue');
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
