/* global carto */
const vizs = [
    `width: 7
    color: rgb(204,0,0)`,

    `width: 7
    color: rgba(204,0,0,0.2)
    strokeColor: opacity(white, 0.2)`,

    `width: 7
    color: hsv(0, 0, 1)`,

    `width: 7
    color: hsv(0, 0.7, 1.)`,

    `width: 7
    color: hsv(0.2, 0.7, 1.)`,

    `width: 7
    color: hsv(0.7, 0.7, 1.)`,

    `width: 7
    color: hsv($category, 0.7, 1.)`,

    `width: 7
    color: ramp($category, PRISM)`,

    `width: 7
    color: ramp(top($category, 4), PRISM)`,

    `width: 7
    color: opacity(ramp($category, PRISM), $amount/5000)
    strokeWidth: 0`,

    `width: 7
    color: ramp($category, PRISM)
    strokeWidth: 0`,

    `width: sqrt($amount/5000)*20
    color: ramp($category, PRISM)
    strokeWidth: 0`,

    `width: sqrt($amount/5000)*20*(zoom()/20+0.01)*1.5
    color: ramp($category, PRISM)
    strokeWidth: 0`,

    `width: sqrt($amount/5000)*20*(zoom()/20+0.01)*1.5
    color: ramp($category, PRISM)
    strokeColor: rgba(0,0,0,0.7)
    strokeWidth: 2*zoom()/25`,

    `width: sqrt(clusterSum($amount)/50000)*20*(zoom()/20+0.01)*1.5
    color: ramp(clusterMode($category), PRISM)
    strokeColor: rgba(0,0,0,0.7)
    strokeWidth: 2*zoom()/25`
];

const BASEMAPS = {
    DarkMatter: carto.basemaps.darkmatter,
    Voyager: carto.basemaps.voyager,
    Positron: carto.basemaps.positron
};

const DEFAULT_BASEMAP = 'DarkMatter';

const sourceTypes = {
    DATASET: 'dataset',
    QUERY: 'query'
};

let index = 0; // current debug step

let basemap = '';
let mapboxgl = window.mapboxgl;
let map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [0, 0],
    zoom: 0
});

// 'examples' must be defined in `examples.js` file
// eslint-disable-next-line no-undef
examples.forEach(addExample);

let layer = null;
setInterval(() => {
    if (layer) {
        document.getElementById('title').innerText = `Features: ${layer.getNumFeatures()}`;
    }
}, 500);

map.on('zoom', updateMapInfo);
map.on('move', updateMapInfo);

function updateMapInfo () {
    let center = map.getCenter();
    document.querySelector('.map-info').innerText = `Center: [${center.lng.toFixed(6)}, ${center.lat.toFixed(6)}]  Zoom: ${map.getZoom().toFixed(6)}`;
}

map.on('load', () => {
    updateMapInfo();

    function updateViz (v) {
        if (v.target) {
            v = event.target.value;
        }
        v = v || document.getElementById('styleEntry').value;
        document.getElementById('styleEntry').value = v;
        document.getElementById('feedback').style.display = 'none';
        saveConfig();

        try {
            if (layer) {
                showLoader();
                layer.blendToViz(new carto.Viz(v))
                    .then(() => {
                        hideLoader();
                    })
                    .catch(error => {
                        handleError(error);
                        hideLoader();
                    });
            }
        } catch (error) {
            handleError(error);
            hideLoader();
        }
    }

    function barcelona () {
        document.getElementById('source').value = 'spend_data';
        document.getElementById('user').value = 'cartovl';
        document.getElementById('serverURL').value = 'https://{user}.carto.com';

        document.getElementById('styleEntry').value = vizs[index];
        superRefresh({ zoom: 13, center: [2.17, 41.38], basemap: 'DarkMatter' });
    }

    document.getElementById('prev-button').addEventListener('click', () => {
        if (document.getElementById('source').value !== 'spend_data') {
            barcelona();
        }
        index = mod(--index, vizs.length);
        updateViz(vizs[index]);
    });
    document.getElementById('next-button').addEventListener('click', () => {
        if (document.getElementById('source').value !== 'spend_data') {
            barcelona();
        }
        index = mod(++index, vizs.length);
        updateViz(vizs[index]);
    });

    document.getElementById('barcelona').addEventListener('click', barcelona);
    document.getElementById('styleEntry').addEventListener('input', updateViz);
    document.getElementById('source-dataset').addEventListener('input', superRefresh);
    document.getElementById('source-query').addEventListener('input', superRefresh);
    document.getElementById('source').addEventListener('input', superRefresh);
    document.getElementById('user').addEventListener('input', superRefresh);
    document.getElementById('serverURL').addEventListener('input', superRefresh);

    if (location.hash.length > 1) {
        const config = JSON.parse(atob(location.hash.substring(1)));
        setConfig(config);
    } else {
        barcelona();
    }

    map.on('moveend', saveConfig);
});

function saveConfig () {
    location.hash = getConfig();
}

function getConfig () {
    return '#' + btoa(JSON.stringify(getJSONConfig()));
}

function getJSONConfig () {
    return {
        a: document.getElementById('source').value,
        b: '',
        c: document.getElementById('user').value,
        d: document.getElementById('serverURL').value,
        e: document.getElementById('styleEntry').value,
        f: map.getCenter(),
        g: map.getZoom(),
        h: basemap,
        i: document.querySelector('input[name="source"]:checked').value
    };
}

function setConfig (c) {
    if (c.d === 'carto.com') {
        c.d = 'https://{user}.carto.com';
    }

    if (!c.i) {
        c.i = sourceTypes.DATASET;
    }

    document.getElementById('source').value = c.a;
    document.getElementById('user').value = c.c;
    document.getElementById('serverURL').value = c.d;
    document.getElementById('styleEntry').value = c.e;
    document.getElementById('source-dataset').checked = c.i === sourceTypes.DATASET;
    document.getElementById('source-query').checked = c.i === sourceTypes.QUERY;

    try {
        superRefresh({ zoom: c.g, center: c.f, basemap: c.h });
    } catch (error) {
        handleError(error);
        hideLoader();
    }
}

const superRefresh = (opts) => {
    const sourceType = document.querySelector('input[name="source"]:checked').value;
    const sourceAuth = {
        username: document.getElementById('user').value,
        apiKey: 'default_public'
    };

    const sourceUrl = {
        serverURL: document.getElementById('serverURL').value
    };

    opts = opts || {};
    showLoader();

    const source = sourceType === sourceTypes.QUERY
        ? new carto.source.SQL(document.getElementById('source').value, sourceAuth, sourceUrl)
        : new carto.source.Dataset(document.getElementById('source').value, sourceAuth, sourceUrl);

    const vizStr = document.getElementById('styleEntry').value;
    const viz = new carto.Viz(vizStr);

    setupMap(opts);

    if (!layer) {
        layer = new carto.Layer('myCartoLayer', source, viz);
        layer.on('loaded', () => {
            saveConfig();
            document.getElementById('feedback').style.display = 'none';
            hideLoader();
        });
        layer.addTo(map, 'watername_ocean');
    } else {
        layer.hide();
        layer.update(source, viz)
            .then(() => {
                layer.show();
                saveConfig();
                document.getElementById('feedback').style.display = 'none';
                hideLoader();
            })
            .catch(error => {
                handleError(error);
                hideLoader();
            });
    }
};

function setupMap (opts) {
    opts = opts || {};
    if (opts.zoom !== undefined) {
        map.setZoom(opts.zoom);
    }
    if (opts.center !== undefined) {
        map.setCenter(opts.center);
    }
    setBasemap(opts.basemap || DEFAULT_BASEMAP);
    createBasemapElements();
}

function handleError (error) {
    const err = `Invalid viz: ${error}:${error.stack}`;
    console.warn(err);
    document.getElementById('feedback').innerText = err;
    document.getElementById('feedback').style.display = 'block';
}

function createBasemapElements () {
    const basemapSelector = document.querySelector('#basemap');
    basemapSelector.innerHTML = '';
    Object.keys(BASEMAPS).forEach(id => {
        const l = document.createElement('label');
        const i = document.createElement('input');
        i.type = 'radio';
        i.value = id;
        i.name = 'basemap';
        i.checked = id === basemap;

        i.onclick = (event) => {
            setBasemap(event.target.value);
            saveConfig();
        };
        i.selected = 'selected';
        l.appendChild(i);

        const s = document.createElement('span');
        s.innerText = id;
        l.appendChild(s);

        basemapSelector.appendChild(l);
    });
}

function setBasemap (id) {
    if (basemap !== id) {
        basemap = id;
        map.setStyle(BASEMAPS[basemap]);
        let added = false;
        map.on('sourcedata', () => {
            if (map.isStyleLoaded() && !added) {
                layer.addTo(map, 'watername_ocean');
                added = true;
            }
        });
    }
}

const $map = document.getElementById('map');
const $fullscreenButton = document.getElementById('fullscreen');

$fullscreenButton.onclick = () => {
    if ($map.style.position === 'fixed') {
        exitFullScreen();
    } else {
        enterFullScreen();
    }
};

function enterFullScreen () {
    $fullscreenButton.style.position = 'fixed';
    $fullscreenButton.style.top = '10px';
    $fullscreenButton.style.right = '10px';
    $fullscreenButton.style.zIndex = '1000';
    $fullscreenButton.innerText = 'Exit Fullscreen';

    $map.style.position = 'fixed';
    $map.style.left = '0';
    $map.style.right = '0';
    $map.style.top = '0';
    $map.style.bottom = '0';
    $map.style.zIndex = '1';
    map.resize();
}

function exitFullScreen () {
    $fullscreenButton.style.position = '';
    $fullscreenButton.style.top = '';
    $fullscreenButton.style.right = '';
    $fullscreenButton.style.zIndex = '';
    $fullscreenButton.innerText = 'Fullscreen';

    $map.style.position = '';
    $map.style.left = '';
    $map.style.right = '';
    $map.style.top = '';
    $map.style.bottom = '';
    $map.style.zIndex = '';
    map.resize();
}

const $exportMapButton = document.getElementById('export-map-button');
const $copyHTMLButton = document.getElementById('copy-html-button');
const $mapTextarea = document.getElementById('map-textarea');

if ($exportMapButton) {
    $exportMapButton.addEventListener('click', () => {
        const config = getJSONConfig();
        $mapTextarea.value = generateSnippet(config);
    });
}

if ($copyHTMLButton) {
    $copyHTMLButton.addEventListener('click', () => {
        $mapTextarea.select();
        document.execCommand('copy');
    });
}

/**
 * Generates an HTML template for the given map configuration
 */

function generateSnippet (config) {
    const apiKey = config.b || 'default_public';
    const username = config.c;
    const serverURL = config.d || 'https://{user}.carto.com';
    const vizSpec = config.e || '';
    const center = config.f || { lat: 0, lng: 0 };
    const zoom = config.g || 10;
    const basemap = BASEMAPS[config.h] || 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

    const source = config.i === sourceTypes.DATASET
        ? `new carto.source.Dataset("${config.a}")`
        : `new carto.source.SQL(\`${config.a}\`)`;

    return `<!DOCTYPE html>
<html>
<head>
<title>Exported map | CARTO VL</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta charset="UTF-8">
<script src="http://libs.cartocdn.com/carto-vl/v${carto.version}/carto-vl.js"></script>
<script src="https://api.tiles.mapbox.com/mapbox-gl-js/v0.52.0/mapbox-gl.js"></script>
<link href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.52.0/mapbox-gl.css" rel="stylesheet" />
<style>
    html, body {
        margin: 0;
    }
    #map {
        position: absolute;
        width: 100%;
        height: 100%;
    }
</style>
</head>
<body>
<div id="map"></div>
<script>
    const map = new mapboxgl.Map({
        container: 'map',
        style: '${basemap}',
        center: [${center.lng}, ${center.lat}],
        zoom: ${zoom}
    });

    carto.setDefaultConfig({
        serverURL: '${serverURL}'
    });

    carto.setDefaultAuth({
        username: '${username}',
        apiKey: '${apiKey}'
    });


    const source = ${source};
    const viz = new carto.Viz(\`
        ${vizSpec}
    \`);
    const layer = new carto.Layer('layer', source, viz);

    layer.addTo(map, 'watername_ocean');
</script>
</body>
</html>
`;
}

function showLoader () {
    document.querySelector('.loader').style.display = 'block';
}

function hideLoader () {
    document.querySelector('.loader').style.display = 'none';
}

function addExample (example) {
    const [name, config] = example;
    let button = document.createElement('button');
    button.innerText = name;
    button.onclick = () => {
        setConfig(config);
    };
    document.getElementById('buttonlist').appendChild(button);
}

function mod (a, b) {
    return ((a % b) + b) % b;
}
