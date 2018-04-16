const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const points = new carto.source.GeoJSON(sources['collection-point']);
const polygon = new carto.source.GeoJSON(sources['polygon']);
const viz = new carto.Viz('color: rgb(255, 0, 0)');
const layer = new carto.Layer('layer', points, viz);
layer.addTo(map);
layer.update(polygon, viz);
