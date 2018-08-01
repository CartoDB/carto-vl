const map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [0, 40],
    zoom: 2
});

const source = new carto.source.GeoJSON(sources['polygon-collection']);
const viz = new carto.Viz(`
    color: opacity(ramp($color, [blue, red]), 0.8)
    strokeColor: opacity(black, 0.5)
    strokeWidth: 10
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
