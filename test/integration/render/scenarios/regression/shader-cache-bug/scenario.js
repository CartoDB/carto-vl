const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['points-with-5-properties']);
const viz = new carto.Viz(`
    color:          blend(red, green, $p0+$p1*10 == 21)
    strokeColor:    blend(red, green, $p2+$p3*10 == 43)
    width: 20
    strokeWidth: 10
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    map.triggerRepaint();
    layer.on('updated', () => {
        window.loaded = true;
    });
});
