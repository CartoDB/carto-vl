const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['points']);
const viz = new carto.Viz(`
    color: ramp(linear($numeric, 0, 10), reverse(@palette))
    width: 50
    @palette: [rgb(255,0,0), rgb(0,255,0), rgb(0,0,255)]
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
