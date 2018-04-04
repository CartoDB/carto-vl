const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const points = new carto.source.GeoJSON(sources['points-with-5-properties']);
const style1 = new carto.Style('width: 100, color: rgba(255, 0, 0, 0.5)');
const style2 = new carto.Style('width: 70, color: rgba(0, 0, 255, 0.5)');
const layer1 = new carto.Layer('layer', points, style1);
const layer2 = new carto.Layer('layer', points, style2);
layer1.addTo(map);
layer2.addTo(map);
