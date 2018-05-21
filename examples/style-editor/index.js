/* global carto */
/*eslint no-console: ["off"] */

const BASEMAPS = {
    DarkMatter: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    Voyager: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    Positron: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
};


const url = new URL(window.location);
const searchParams = new URLSearchParams(url.search);

const basemap = BASEMAPS[searchParams.get('basemap') || 'DarkMatter'];
const mapboxgl = window.mapboxgl;
const map = new mapboxgl.Map({
    container: 'map',
    style: basemap,
    center: [0, 0],
    zoom: 0,
    dragRotate: false // disable drag to rotate handling
});

let styles = JSON.parse(searchParams.get('styles')) || [''];

const stylesDiv = document.getElementById('styles');
let update = () => { };
styles.map((style, index) => {
    const styleRow = document.createElement('textarea');
    styleRow.value = style;
    styleRow.className = 'twelve columns';
    styleRow.oninput = () => {
        styles[index] = styleRow.value;
        update();
    };
    styleRow.onclick = () => {
        styleIndex = index;
        update();
    };
    stylesDiv.appendChild(styleRow);
});

// TODO dataset

/*[
    'color: red',
    'color: blue',
];*/
let styleIndex = searchParams.get('index') || 0;

carto.setDefaultAuth({
    user: 'cartovl',
    apiKey: 'default_public'
});

const layer = new carto.Layer('myCartoLayer', new carto.source.Dataset('ne_10m_populated_places_simple'), new carto.Viz(styles[styleIndex]));
layer.addTo(map, 'watername_ocean');


layer.on('loaded', () => {
    update = () => {
        try {
            document.getElementById('feedback').style.display = 'none';
            layer.blendToViz(new carto.Viz(styles[styleIndex]));
        } catch (error) {
            const err = `Invalid viz: ${error}:${error.stack}`;
            console.warn(err);
            document.getElementById('feedback').value = err;
            document.getElementById('feedback').style.display = 'block';
        }
    };
    update();
});
