const map = new mapboxgl.Map({
    container: 'map',
    style: carto.basemaps.voyager,
    center: [0, 0],
    zoom: 0
});

map.on('load', () => {
    window.loaded = true;
});
