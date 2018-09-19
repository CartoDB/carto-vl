const map = new mapboxgl.Map({
    container: 'map',
    style: 'http://localhost:5000/test/common/basemaps/voyager-gl-style.json',
    center: [-73.97720677029952, 40.77784846220871],
    zoom: 13

});

const metadata = {
    idProperty: 'attr_0',
    properties: {}
};

let wadus = [];
let vizSpec = 'color: ramp(linear($attr_0, 0, 1000), temps)\n';
for (let i = 0; i < 600; i++) {
    metadata.properties['attr_' + i] = { type: 'number' };
    vizSpec += `@A${i}: $attr_${i}\n`;
    wadus.push(`$attr_${i}`);
}
vizSpec += `\n@wadus: viewportFeatures(${wadus.join()})`;

const source = new carto.source.MVT('./test.mvt', metadata);
const viz = new carto.Viz(vizSpec);
const layer = new carto.Layer('layer', source, viz);

layer.addTo(map, 'watername_ocean');
layer.on('loaded', () => {
    window.loaded = true;
});
