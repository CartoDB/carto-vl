/* global carto geojson */

const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(geojson);
const style = new carto.Style(`
    width: 20,
    color: hsv(0, linear($numeric, 0, 10), 1)
`);
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
