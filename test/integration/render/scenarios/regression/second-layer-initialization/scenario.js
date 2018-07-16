const map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [0, 0],
    zoom: 0
});

const points = new carto.source.GeoJSON(sources['collection-point']);
const polygon = new carto.source.GeoJSON(sources['polygon']);
const viz1 = new carto.Viz('color: rgb(255, 0, 0), width: 50');
const viz2 = new carto.Viz('color: rgb(255, 0, 255)');
const layer1 = new carto.Layer('layer1', points, viz1);
const layer2 = new carto.Layer('layer2', polygon, viz2);

layer1.addTo(map);
layer2.addTo(map);

let layersLoaded = 0;

layer1.on('loaded', () => {
    layersLoaded++;
    if (layersLoaded == 2){
        window.loaded=true;
    }
});

layer2.on('loaded', () => {
    layersLoaded++;
    if (layersLoaded == 2){
        window.loaded=true;
    }
});
