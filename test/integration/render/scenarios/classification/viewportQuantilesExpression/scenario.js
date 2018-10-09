const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['many-points']);
const viz = new carto.Viz('color: ramp(viewportQuantiles(mul($numeric, 5), 3), PRISM), width: 50');
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
