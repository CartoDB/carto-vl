const map = new CartoMap({
    container: 'map',
    background: 'white'
});

const source = new carto.source.GeoJSON(sources['line-joins']);
const style = new carto.Viz('width: 20');
const layer = new carto.Layer('layer', source, style);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
