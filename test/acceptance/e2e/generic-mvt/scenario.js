const map = new mapboxgl.Map({
    container: 'map',
    style: 'http://localhost:5000/test/common/basemaps/voyager-gl-style.json',
    center: [-73.97720677029952, 40.77784846220871],
    zoom: 13

});

const metadata = {
    idProperty: 'cartodb_id',
    properties: {
        winner: { type: 'category' }
    }
};

const source = new carto.source.MVT('./5_15_10.mvt', metadata);
const viz = new carto.Viz(`
    color: ramp(buckets($winner, ["Conservative Party", "Labour Party"]), [blue, red])
    strokeColor: opacity(white, 0.6)
`);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map, 'watername_ocean');
layer.on('loaded', () => {
    window.loaded = true;
});
