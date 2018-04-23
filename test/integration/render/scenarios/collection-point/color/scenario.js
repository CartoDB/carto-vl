const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['collection-point']);
const viz = new carto.Viz('color: rgba(255, 0, 0, 1)');
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
