
const $map = document.getElementById('map');
$map.style.width = '400px';
$map.style.height = '300px';

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

const viz1 = new carto.Viz(`
    color: blend(red, green, viewportCount() == 2)
    strokeWidth: 0,
    @list: viewportFeatures($value);
    transform: translate(-165 , 0)
`);

const layer1 = new carto.Layer('triangles_without_stroke', source1, viz1);

layer1.addTo(map, 'background');

layer1.on('loaded', () => {
    window.loaded = true;
});
