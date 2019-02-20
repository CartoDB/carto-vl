const map = new CartoMap({
    container: 'map',
    background: 'blue'
});

const source = new carto.source.GeoJSON(sources['points']);
const viz = new carto.Viz(`
width: 50
symbol: house
symbolPlacement: align_bottom
filter: linear($numeric)
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
