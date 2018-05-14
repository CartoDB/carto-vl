const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['points']);
const viz = new carto.Viz('color: ramp(globalQuantiles($numeric, 3), PRISM), width: 50');
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
