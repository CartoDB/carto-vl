const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['many-points']);
const viz = new carto.Viz(`
    width: $numeric*5
    strokeWidth: 1
    order: asc(@w)
    @w: width()
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
