const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['points2']);
const viz = new carto.Viz('color: ramp(buckets($cat2, [\'a\',\'b\',\'c\']), prism), @cat: $cat');
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
