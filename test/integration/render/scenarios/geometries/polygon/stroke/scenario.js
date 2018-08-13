const map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [0, 0],
    zoom: 0
});

const source = new carto.source.GeoJSON(sources['polygon']);
const viz = new carto.Viz(`
    color: red
    strokeColor: green
    strokeWidth: 3
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
