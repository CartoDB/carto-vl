const map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [0, 40],
    zoom: 2
});

const source = new carto.source.GeoJSON(sources['line-string-collection']);
const viz = new carto.Viz('width: 30');
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
