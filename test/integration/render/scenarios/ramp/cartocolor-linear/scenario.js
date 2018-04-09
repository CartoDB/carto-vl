const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['points']);
const style = new carto.Style('color: ramp(linear($numeric, 0, 10), prism), width: 50');
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
