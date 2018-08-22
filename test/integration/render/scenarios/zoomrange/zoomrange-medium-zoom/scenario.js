const map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [0, 0],
    zoom: 0.0035
});

const points = new carto.source.GeoJSON(sources['points']);
const viz = new carto.Viz('width: ramp(zoomrange([0, 0.01]), [4, 100]), strokeWidth: 0');
const layer = new carto.Layer('layer1', points, viz);

layer.addTo(map);

layer.on('loaded', () => {
    window.loaded = layer;
});
