const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['point']);
const viz = new carto.Viz('color: hsva(0.59, 0.89, 1.0, 0.5)');
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
