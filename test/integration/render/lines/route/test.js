/* global mapboxgl carto */

carto.setDefaultAuth({
    user: 'arroyo-carto',
    apiKey: 'YOUR_API_KEY'
});

const map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [50, 30],
    zoom: 2
});

const source = new carto.source.Dataset('route');
const style = new carto.Style(`
  width: 10,
  color: rgba(0,1,1,1)
`);
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
