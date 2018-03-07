/* global carto */

const map = new carto.Map({
    container: 'map'
});

// const source = new carto.source.GeoJSON('./test.geojson');
const source = new carto.source.GeoJSON({
    type: 'FeatureCollection',
    features: [
        {
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
        },
        {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [
                    10,
                    10
                ]
            },
            properties: {
                cartodb_id: 2
            }
        }
    ]
});
const style = new carto.Style(`
    width: 100
`);
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
