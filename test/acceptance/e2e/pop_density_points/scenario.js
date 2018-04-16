const map = new mapboxgl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    center: [-20, 33],
    zoom: 3
});

carto.setDefaultAuth({
    user: 'cartogl',
    apiKey: 'YOUR_API_KEY'
});

const source = new carto.source.Dataset('pop_density_points');
const s = carto.viz.expressions;
const $dn = s.property('dn');
const viz = new carto.Viz({
    width: 4 * s.zoom(),
    color: s.ramp(s.linear($dn, 1, 300), s.palettes.prism),
    strokeColor: s.rgba(0, 0, 0, 0.2),
    strokeWidth: 1,
    filter: s.between($dn, 100, 140)
});
const layer = new carto.Layer('myCartoLayer', source, viz);

layer.addTo(map);
