const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['many-points']);
const viz = new carto.Viz('color: ramp(viewportStandardDev(add($numeric, 100), 5), TEALROSE), width: 50');
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
