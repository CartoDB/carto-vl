/* global carto */

const map = new carto.Map({
    container: 'map'
});

// const source = new carto.source.GeoJSON('./test.geojson');
const source = new carto.source.GeoJSON({
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [
            0,
            0
        ]
    },
    properties: {
        cartodb_id: 1
    }
});
const style = new carto.Style(`
    width: 100
`);
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
