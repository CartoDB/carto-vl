const map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [-122.01, 45.645],
    zoom: 12
});

const source = new carto.source.GeoJSON(sources['hike']);
const viz = new carto.Viz('width: 10 filter: 0.5');
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
