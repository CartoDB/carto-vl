const map = new carto.Map({
    container: 'map',
    background: 'white'
});

const source = new carto.source.GeoJSON(sources['points']);
const style = new carto.Style('color: ramp(linear($numeric, 0, 10), [hsva(0,1,1,1), hsva(0,1,1,0.2)]), width: 50');
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
