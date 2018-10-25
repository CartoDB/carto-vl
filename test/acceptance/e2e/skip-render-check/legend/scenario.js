const map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [-74, 40.7],
    zoom: 12
});

carto.setDefaultAuth({
    user: 'localhost',
    apiKey: '1234'
});
carto.setDefaultConfig({
    serverURL: 'http://127.0.0.1:8181/user/{user}'
});
const buckets = 5;
const source = new carto.source.Dataset('mnmappluto');
const viz = new carto.Viz(`
    color: ramp(top($landuse, ${buckets}), Bold)
    strokeWidth: 0
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', async function () {
    const legend = viz.color.getLegendData();
    const expectedBuckets = buckets + 1; // this covers the "CARTO_VL_OTHERS" extra category bucket
    assert(legend.data.length === expectedBuckets, 'Unexpected number of buckets');
    assert(legend.data[buckets].key === 'CARTO_VL_OTHERS', 'Last bucket should be the special OTHERS bucket');
    window.loaded = true;
});
