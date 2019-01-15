const map = new mapboxgl.Map({
    container: 'map',
    center: [0, 0],
    style: { version: 8, sources: {}, layers: [] },
    zoom: 0
});

const source = new carto.source.GeoJSON(sources['points']);
const viz = new carto.Viz();
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map, 'background');

// Setting map's style after trying to add the layer...
const style = {
    version: 8,
    sources: {},
    layers: [{
        id: 'background',
        type: 'background',
        paint: {
            'background-color': 'black'
        }
    }]
};
map.setStyle(style);

layer.on('loaded', () => {
    window.loaded = true;
});
