const map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [0, 0],
    zoom: 0
});

const source0 = new carto.source.GeoJSON(sources['point']);
const viz0 = new carto.Viz(`
    color: rgb(255,0,0)
    width: 40
`);
const layer0 = new carto.Layer('layer0', source0, viz0);

const source1 = new carto.source.GeoJSON(sources['line-string']);
const viz1 = new carto.Viz(`
    color: rgb(0,255,0)
    width: 40
`);
const layer1 = new carto.Layer('layer1', source1, viz1);

layer1.addTo(map);
layer0.addTo(map);
