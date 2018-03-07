/* global carto geojson */

const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(geojson);
const style = new carto.Style();
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
