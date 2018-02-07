/*eslint-env jquery*/
/*eslint no-console: ["off"] */

let mapboxgl = window.mapboxgl;
mapboxgl.accessToken = 'pk.eyJ1IjoiZG1hbnphbmFyZXMiLCJhIjoiY2o5cHRhOGg5NWdzbTJxcXltb2g2dmE5NyJ9.RVto4DnlLzQc26j9H0g9_A';
let map = new mapboxgl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [2.17, 41.38],
    zoom: 0,
});

const auth = {
    user: 'dmanzanares',
    apiKey: 'd9d686df65842a8fddbd186711255ce5d19aa9b8'
};

(new carto.Layer('myCartoLayer', new carto.source.Dataset('ne_10m_populated_places_simple', auth), new carto.Style())).addTo(map, 'watername_ocean');
(new carto.Layer('myCartoLayer2', new carto.source.Dataset('world_borders', auth), new carto.Style())).addTo(map, 'watername_ocean');
