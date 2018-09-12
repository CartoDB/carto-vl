const map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [0, 0],
    zoom: 0
});

const source = new carto.source.GeoJSON(sources['points']);

const viz = new carto.Viz('width: 50, symbol: cross');
viz.color.blendTo('red');
viz.color.mix = carto.expressions.number(0); // expected --> original black color is kept, not overriden

const layer = new carto.Layer('layer', source, viz);

layer.addTo(map);
layer.on('loaded', () => {
    window.loaded = true;
});
