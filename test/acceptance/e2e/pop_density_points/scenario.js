const map = new mapboxgl.Map({
    container: 'map',
    style: 'http://localhost:5000/test/common/basemaps/voyager-gl-style.json',
    center: [-20, 33],
    zoom: 0
});

carto.setDefaultAuth({
    username: 'localhost',
    apiKey: '1234'
});
carto.setDefaultConfig({
    serverURL: 'http://127.0.0.1:8181/user/{user}'
});

const source = new carto.source.Dataset('pop_density_points');
const viz = new carto.Viz(`
    @dn: clusterAvg($dn)
    width: scaled(10, 4)
    color: ramp(linear(@dn, viewportMin(@dn), viewportMax(@dn)), Prism)
    strokeColor: rgba(0, 0, 0, 0.2)
    strokeWidth: 1
    filter: between(@dn, 100, 300)
    resolution: 2
`);
const layer = new carto.Layer('myCartoLayer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
