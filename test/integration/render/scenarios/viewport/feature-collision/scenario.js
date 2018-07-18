const VIEWPORT_SIZE = 500;

const $map = document.getElementById('map');
$map.style.width = `${VIEWPORT_SIZE}px`;
$map.style.height = `${VIEWPORT_SIZE}px`;

const map = new mapboxgl.Map({
    container: 'map',
    style: {
        version: 8,
        sources: {},
        layers: [{
            id: 'background',
            type: 'background',
            paint: {
                'background-color': 'black'
            }
        }]
    },
    center: [0, 0],
    zoom: 0,
    dragRotate: false
});

const source = new carto.source.GeoJSON(sources['triangle-collision']);

const viz = new carto.Viz(`
    color: blend(red, green, viewportCount() == 2)
    strokeWidth: 0,
    @list: viewportFeatures($value);
`);

const layer = new carto.Layer('layer', source, viz);

layer.addTo(map, 'background');

layer.on('loaded', () => {
    window.loaded = true;
});
