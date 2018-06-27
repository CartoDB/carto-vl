const map = new carto.Map({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['points']);
const viz = new carto.Viz(`
    width: 20,
    color: hsv(0, linear($numeric, 0, 10), 1)
    filter: not(isNaN($numeric))
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
