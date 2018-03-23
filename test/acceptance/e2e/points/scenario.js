const map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [-20, 33],
    zoom: 2
});

carto.setDefaultAuth({
    user: 'cartogl',
    apiKey: 'YOUR_API_KEY'
});

const source = new carto.source.Dataset('points_0');
const s = carto.style.expressions;
const $amount = s.property('amount');
const style = new carto.Style({
    width: s.float(100),
    color: s.hsv(0.3, .5, .9),
    strokeColor: s.cielab(80, -10, -70),
    strokeWidth: s.float(10),
    filter: s.or(s.lte($amount, s.float(100)), s.gt($amount, s.float(299)))
});
const layer = new carto.Layer('myCartoLayer', source, style);

layer.addTo(map);
