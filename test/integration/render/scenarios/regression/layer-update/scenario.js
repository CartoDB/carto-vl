const map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [0, 0],
    zoom: 0
});

const points = new carto.source.GeoJSON(sources['point-collection']);
const polygon = new carto.source.GeoJSON(sources['polygon']);
const viz = new carto.Viz('color: rgb(255, 0, 0)');
const layer = new carto.Layer('layer', points, viz);
layer.addTo(map);
layer.on('loaded', () => {
    layer.update(polygon, viz).then(() => {
        layer.on('updated', () => {
            window.loaded = true;
        });
    });
});
