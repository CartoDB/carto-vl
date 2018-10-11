const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['points-concentric']);
const viz = new carto.Viz(`
    width: 20,
    color: hsv(0, linear($numeric, 0, 10), 1)
    transform: translate(4*$numeric, 4*$numeric)
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
