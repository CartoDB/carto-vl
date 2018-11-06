const map = new CartoMap({
    container: 'map',
    background: 'black'
});

const points = new carto.source.GeoJSON(sources['points']);
const points2 = new carto.source.GeoJSON(sources['points']);
const oriRequestMetadata = points2.requestMetadata.bind(points2);
points2._clone = function () { return this; };
points2.requestMetadata = async (...args) => {
    await sleep(100);
    return oriRequestMetadata(...args);
};

const viz1 = new carto.Viz('width: 0*animation($numeric, .3, fade(.1)) color: #F008');
const viz2 = new carto.Viz('width: 0*animation($numeric, .3, fade(.1)) color: #0F08 transform:translate(0, 100)');
const layer1 = new carto.Layer('layer1', points, viz1);
const layer2 = new carto.Layer('layer2', points2, viz2);

layer1.addTo(map);
layer2.addTo(map);

carto.on('loaded', [layer1, layer2], async () => {
    await sleep(140);
    const a = viz1.width.b.getProgressValue();
    const b = viz2.width.b.getProgressValue();
    window.loaded = true;
    if (a !== b) {
        throw new Error(`Animations are not synchronized: ${a} : ${b}`);
    }
});

function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
