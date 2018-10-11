const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const points = new carto.source.GeoJSON(sources['points-with-5-properties']);
const viz = new carto.Viz('color: rgba(255, 0, 0, equals($p0*$p1*$p2*$p3*$p4, 1*2*3*4*5))');
const layer = new carto.Layer('layer', points, viz);
layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
