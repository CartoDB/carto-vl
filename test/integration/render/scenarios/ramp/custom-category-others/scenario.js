const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['points']);
const style = new carto.Style('color: ramp(buckets($cat, \'0\', \'1\'), [hsv(0,1,1), hsv(0.5,1,1), hsv(0,0,0.3)]), width: 50');
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
