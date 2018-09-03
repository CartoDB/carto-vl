const map = new mapboxgl.Map({
    container: 'map',
    style: 'http://localhost:5000/test/common/basemaps/voyager-gl-style.json',
    center: [-20, 33],
    zoom: 3.8
});

carto.setDefaultAuth({
    user: 'localhost',
    apiKey: '1234'
});
carto.setDefaultConfig({
    serverURL: 'http://{user}.localhost.lan:8181'
});

const source = new carto.source.Dataset('pop_density_points');
const s = carto.expressions;
const $dn = s.property('dn');
const viz = new carto.Viz({
    width: s.div(s.zoom(), 2 / 1024 * 300),
    color: s.ramp(s.linear($dn, 1, 300), s.palettes.PRISM),
    strokeColor: s.rgba(0, 0, 0, 0.2),
    strokeWidth: 1,
    filter: s.between($dn, 100, 140)
});
const layer = new carto.Layer('myCartoLayer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
