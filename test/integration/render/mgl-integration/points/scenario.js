const map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [0, 0],
    zoom: 0
});

const source = new carto.source.GeoJSON(sources['points']);
const style = new carto.Style(`
    width: 20,
    color: hsv(0, 1, linear($numeric, 0, 10))
`);
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
