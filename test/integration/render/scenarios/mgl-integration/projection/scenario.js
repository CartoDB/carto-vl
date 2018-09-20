const map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [0, 0],
    zoom: 0,
    bearing: 63,
    pitch: 23
});

const source0 = new carto.source.GeoJSON(sources['point']);
const viz0 = new carto.Viz(`
    color: rgb(255,0,0)
    width: 40
`);
const layer0 = new carto.Layer('layer0', source0, viz0);

const source1 = new carto.source.GeoJSON(sources['line-string']);
const viz1 = new carto.Viz(`
    color: rgb(0,0,255)
    width: 20
`);
const layer1 = new carto.Layer('layer1', source1, viz1);

const source2 = new carto.source.GeoJSON(sources['line-string']);
const viz2 = new carto.Viz(`
    color: rgba(0,255,0,0.5)
    width: 40
`);
const layer2 = new carto.Layer('layer2', source2, viz2);

carto.on('loaded', [layer0, layer1, layer2], () => {
    window.loaded = true;
});
layer0.addTo(map);
layer1.addTo(map);
layer2.addTo(map);
