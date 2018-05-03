const map = new mapboxgl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [-74, 40.7],
    zoom: 12
});

carto.setDefaultAuth({
    user: 'cartogl',
    apiKey: 'default_public'
});

const source = new carto.source.Dataset('mnmappluto');
const viz = new carto.Viz(`
    color: ramp(linear(($numfloors), 1, 300), [hsva(0,1,1,0.2)])
`);
const layer = new carto.Layer('myCartoLayer', source, viz);

layer.addTo(map);
