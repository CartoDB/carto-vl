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

    `width: sqrt($amount/5000)*20*(zoom()/4000+0.01)*1.5
color: ramp($category, PRISM)
strokeWidth: 0`,

    `width: sqrt($amount/5000)*20*(zoom()/4000+0.01)*1.5
color: ramp($category, PRISM)
strokeColor:       rgba(0,0,0,0.7)
strokeWidth:      2*zoom()/50000`,

    `width: sqrt(clusterSum($amount)/50000)*20*(zoom()/4000+0.01)*1.5
color: ramp(clusterMode($category), PRISM)
strokeColor:       rgba(0,0,0,0.7)
strokeWidth:      2*zoom()/50000`
];

const examples = [
    [
        'WWI ships',
        {
            a: 'wwi',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `width:  zoom() * (animation($day, 140, fade(0.05, 0.2)) + 0.5)
color:  ramp(linear(clusterAvg($temp), 0,30), tealrose)
strokeWidth: 0
filter: animation($day, 140, fade(0.05, 0.2)) + 0.05
`,
            f: {
                lng: 24.73556852040292,
                lat: 19.163470978754944
            },
            g: 0.843866439231284,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Butterfly migrations',
        {
            a: 'monarch_migration_1',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `width: sqrt(clusterMax($number)/10)
color: opacity(ramp(linear(clusterMax($number)^0.5, 0, 50), Sunset),0.7)
strokeColor: ramp(linear(clusterMax($number)^0.5,0, 50), Sunset)
strokeWidth: 1
`,
            f: {
                lng: -87.70995305070801,
                lat: 37.370049599893434
            },
            g: 2.8377925036325675,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Non-white',
        {
            a: 'table_5yr_county_acs_copy_1',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `width: sqrt(($asian_pop+$black_pop+$hispanic_o)/$white_pop)*2
color: hsva(0.5, 1, 1, 0.7)
strokeWidth: 0
filter: $white_pop > 1 `,
            f: {
                lng: -89.8202341854498,
                lat: 38.02009109105734
            },
            g: 3.133722433724694,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Denver accidents',
        {
            a: 'traffic_accidents_copy',
            b: '',
            c: 'mamataakella',
            d: 'https://{user}.carto.com',
            e: `width:   $count/2
color: opacity( ramp(linear($count, 0,120), RedOr), $count/20)
strokeWidth: 0
`,
            f: {
                lng: -104.96505621566746,
                lat: 39.74961937824622
            },
            g: 11.418718770904494,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'California Wildfires by acreage',
        {
            a: 'fire_perimeters_copy',
            b: '',
            c: 'mamataakella',
            d: 'https://{user}.carto.com',
            e: `width:   $gis_acres/10000
color: rgba(0,0,0,0)
strokeColor:  hsv(0.1, $gis_acres/200000, $gis_acres/400000)
strokeWidth: $gis_acres/50000`,
            f: {
                lng: -116.21387836632636,
                lat: 38.07278318836194
            },
            g: 5.181189861652186,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'California Wildfires size/opacity by acres burned colored by cause ',
        {
            a: 'fire_perimeters_copy',
            b: '',
            c: 'mamataakella',
            d: 'https://{user}.carto.com',
            e: `width: $gis_acres/10000
color: opacity(ramp(linear($cause, 1,14), Prism),$gis_acres/100000)
strokeWidth: 0
`,
            f: {
                lng: -119.67307633790483,
                lat: 37.47815286806755
            },
            g: 4.946911442559713,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Population Density - Filtering & Buckets',
        {
            a: 'pop_density_points',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `width: zoom()
color: ramp(buckets($dn, [80, 100, 140]), prism)
strokeWidth: 0
filter: $dn > 60
`,
            f: {
                lng: 23.45301819237261,
                lat: 11.239956068640154
            },
            g: 1.3559605306411373,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Commuters who travel outside home county for work',
        {
            a: 'commuter_flow_by_county_5',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `width: $workers_in_flow/2903461*100*4
color: opacity(ramp(linear($workers_in_flow,0,100000) ,ag_GrnYl), $residence_fips_concat-$work_fips_concat)
strokeWidth: 0
`,
            f: {
                lng: -101.07701446794584,
                lat: 40.91361168096236
            },
            g: 3.3483738193018637,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Ethnic',
        {
            a: 'table_5yr_county_acs_copy_1',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `@sum_asian: clusterSum($asian_pop)
@sum_black: clusterSum($black_pop)
@sum_white: clusterSum($white_pop)
@sum_hispanic: clusterSum($hispanic_o)
@sum_all: @sum_asian + @sum_black + @sum_hispanic + @sum_white

width: sqrt(@sum_all) / 400 * zoom()
color: opacity(hsv(0.00,1,1) * @sum_black / @sum_all * 1 +
               hsv(0.66,1,1) * @sum_asian / @sum_all * 3 +
               hsv(0.15,0,1) * @sum_white / @sum_all * 0.8 +
               hsv(0.33,1,1) * @sum_hispanic / @sum_all * 1, 0.8)
strokeWidth: 1
strokeColor: #000
order: desc(width())
resolution: 4
`,
            f: {
                lng: -93.89724214905107,
                lat: 35.8750501729363
            },
            g: 3.1080824792155908,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Pluto',
        {
            a: 'mnmappluto',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `color: ramp(linear(log($numfloors), 1, 4), Earth)
strokeColor: opacity(white, 0.2)
`,
            f: {
                lng: -73.99027791402472,
                lat: 40.73561210607173
            },
            g: 11.883377716137133,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Pluto - filtered',
        {
            a: 'mnmappluto',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `color: ramp(linear(log($numfloors), 2, 4), temps)
strokeColor: opacity(white, 0.5)
filter: between($numfloors, 10, 120)
`,
            f: {
                lng: -73.98353344380632,
                lat: 40.747976751327
            },
            g: 12.562936305448682,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'SF Lines',
        {
            a: 'sf_stclines',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `color: ramp($st_type, prism)
width: 1.5
`,
            f: {
                lng: -122.44408486861192,
                lat: 37.773706736149705
            },
            g: 11.664310802866805,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Gecat',
        {
            a: 'select *, 1 as co from gecat_geodata_copy',
            b: '',
            c: 'cdbsol-admin',
            d: 'https://{user}.carto.com',
            e: `color: opacity(ramp(linear(log(clusterAvg($speed)), 0, 4), Geyser), clusterSum($co)*zoom()/100000*1.8*4)
width: 2
strokeWidth: 0
resolution: 0.25`,
            f: {
                lng: 2.17,
                lat: 41.38
            },
            g: 13,
            h: 'DarkMatter',
            i: 'query'
        }
    ],
    [
        'BC Category filtering',
        {
            a: 'tx_0125_copy_copy',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `width: sqrt(clusterSum($amount)/50000)*20*(zoom()/4000+0.01)*1.5
color: ramp(clusterMode($category), Prism)
strokeColor: opacity(white, 0.5)
filter: in(clusterMode($category), [\'Transportes\', \'Salud\'])`,
            f: {
                lng: 2.178173022889041,
                lat: 41.39930591407904
            },
            g: 11.882919042717432,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Crazy images',
        {
            a: 'traffic_accidents_copy',
            b: '',
            c: 'mamataakella',
            d: 'https://{user}.carto.com',
            e: `width: $count/2 +8
color: opacity( ramp(linear($count, 0,120), RedOr), $count/20+0.4)
symbolPlacement: placement(sin(0.1*$count*now()) , cos(0.1*$count*now()))
symbol: ramp(buckets(100*(0.1*now()%1 >0.5),  [50]), [
    image('../styling/marker.svg'),
    image('../styling/star.svg')
])
 `,
            f: {
                lng: -104.96260543125828,
                lat: 39.729360220153495
            },
            g: 12.489655489898993,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Flower image',
        {
            a: 'fire_perimeters_copy',
            b: '',
            c: 'mamataakella',
            d: 'https://{user}.carto.com',
            e: `width: $gis_acres/3000
symbol: ramp(linear($cause, 1,14), Prism) * image('../styling/flower.svg')`,
            f: {
                lng: -119.45492286062716,
                lat: 38.04448855312296
            },
            g: 5.4504873403225105,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ]
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
<script src="https://api.tiles.mapbox.com/mapbox-gl-js/v0.50.0/mapbox-gl.js"></script>
<link href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.50.0/mapbox-gl.css" rel="stylesheet" />
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
