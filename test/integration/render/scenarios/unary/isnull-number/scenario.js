const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['nullpoints']);
const viz = new carto.Viz(`
    width: 20
    strokeWidth: 5*isNull($num)
    color: ramp($num, [red, blue])
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
