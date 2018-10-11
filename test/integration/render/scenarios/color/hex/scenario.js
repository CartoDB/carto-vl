const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const source = new carto.source.GeoJSON(sources['line-string']);
const style = new carto.Viz('color: hex("#F00")');
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
