const map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [0, 0],
    zoom: 0
});

const source0 = new carto.source.GeoJSON(sources['point']);
const style0 = new carto.Style(`
    color: rgb(255,0,0)
    width: 40
`);
const layer0 = new carto.Layer('layer0', source0, style0);

const source1 = new carto.source.GeoJSON(sources['line-string']);
const style1 = new carto.Style(`
    color: rgb(0,255,0)
    width: 40
`);
const layer1 = new carto.Layer('layer1', source1, style1);

layer0.addTo(map);
layer1.addTo(map);
