const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['points']);
// Check that precision is good
const viz = new carto.Viz(`
    @ten: 10
    @oneHundred: @ten * @ten
    width: ramp(linear($numeric, 0, 10), [0.10,0.20,0.30]) * @oneHundred / @ten * 10
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
