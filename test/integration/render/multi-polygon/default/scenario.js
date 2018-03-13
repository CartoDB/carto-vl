/* global carto sources */

const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['multi-polygon']);
const style = new carto.Style();
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
