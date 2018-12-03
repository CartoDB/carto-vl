const map = new CartoMap({
    container: 'map',
    background: 'white'
});

const source = new carto.source.GeoJSON(sources['point']);

const symbol = '/test/common/flower.svg';
const viz = new carto.Viz(`
    width: 50
    // symbol: image('${symbol}') // it is not set here...
`);
viz.symbol.blendTo(`image('${symbol}')`); // ...but here, and the result is the same
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
