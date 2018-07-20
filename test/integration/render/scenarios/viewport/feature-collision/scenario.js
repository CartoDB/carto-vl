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

const source1 = new carto.source.GeoJSON(sources['triangle-collision']);
const source2 = new carto.source.GeoJSON(sources['triangle-collision']);
const source3 = new carto.source.GeoJSON(sources['line-collision']);

const viz1 = new carto.Viz(`
    color: blend(red, green, viewportCount() == 2)
    strokeWidth: 0,
    @list: viewportFeatures($value);
`);

const viz2 = new carto.Viz(`
    strokeColor: blend(red, green, viewportCount() == 3)
    strokeWidth: 30,
    @list: viewportFeatures($value);
`);

const viz3 = new carto.Viz(`
    color: blend(blue, yellow, viewportCount() == 3)
    width: 50
    @list: viewportFeatures();
`);

const layer1 = new carto.Layer('triangles_without_stroke', source1, viz1);
const layer2 = new carto.Layer('triangles_with_stroke', source2, viz2);
const layer3 = new carto.Layer('lines', source3, viz3);

layer2.addTo(map, 'background');
layer1.addTo(map, 'background');
layer3.addTo(map, 'background');

layer1.on('loaded', () => {
    if (!window.loaded) {
        window.loaded = true;
    }
});

layer2.on('loaded', () => {
    if (!window.loaded) {
        window.loaded = true;
    }
});

layer3.on('loaded', () => {
    if (!window.loaded) {
        window.loaded = true;
    }
});
