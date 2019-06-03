const map = new CartoMap({
    container: 'map',
    background: 'white'
});

const source = new carto.source.GeoJSON(sources['points']);

// Fake long ramp, made by repetition
const length = 256;
const categories = Array.from({ length }).reduce((a, b, idx) => {
    a[`'${idx}'`] = 'image(\'/test/common/flower.svg\')';
    return a;
}, {});

// Using the ListImage in a viz
const keys = Object.keys(categories);
const values = Object.values(categories);
const viz = new carto.Viz(`symbol: ramp(buckets($cat, [${keys}]), [${values}])`);

const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
