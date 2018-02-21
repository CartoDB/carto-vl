/* global carto */
/*eslint-env jquery*/
/*eslint no-console: ["off"] */

const styles = [
    `width: 3
color: rgba(0.8,0,0,1)`,

    `width: 3
color: rgba(0.8,0,0,0.2)`,

    `width: 3
color: hsv(0, 0, 1)`,

    `width: 3
color: hsv(0, 0.7, 1.)`,

    `width: 3
color: hsv(0.2, 0.7, 1.)`,

    `width: 3
color: hsv(0.7, 0.7, 1.)`,

    `width: 3
color: hsv($category, 0.7, 1.)`,

    `width: 3
color: ramp($category, Prism)`,

    `width: 3
color: ramp(top($category, 4), Prism)`,

    `width: 3
color: setOpacity( ramp($category, Prism), $amount/5000)`,

    `width: 3
color: ramp($category, Prism)`,

    `width: sqrt($amount/5000)*20
color: ramp($category, Prism)`,

    `width: sqrt($amount/5000)*20*(zoom()/4000+0.01)*1.5
color: ramp($category, Prism)`,

    `width: sqrt($amount/5000)*20*(zoom()/4000+0.01)*1.5
color: ramp($category, Prism)
strokeColor:       rgba(0,0,0,0.7)
strokeWidth:      2*zoom()/50000`,

    `width: sqrt(SUM($amount)/50000)*20*(zoom()/4000+0.01)*1.5
color: ramp(MODE($category), Prism)
strokeColor:       rgba(0,0,0,0.7)
strokeWidth:      2*zoom()/50000`,
];

const texts = [
    'We can use RGBA colors',

    'This means that we can change the opacity (alpha) easily',

    'There is support for other color spaces like HSV (Hue, Saturation, Value)',

    'Hue, Saturation and Value are defined in the [0,1] range, the hue is wrapped (cylindrical space)',
    'Hue, Saturation and Value are defined in the [0,1] range, the hue is wrapped (cylindrical space)',
    'Hue, Saturation and Value are defined in the [0,1] range, the hue is wrapped (cylindrical space)',

    'You can mix expressions. Here we are setting the hue based on the category of each feature',

    'We can use turbo-carto inspired ramps too',

    'We can select the top categories, by grouping the rest into the \'others\' buckets',

    'We can normalize the map based on the amount property by changing the opacity',

    'But, let\'s go back a little bit...',

    'We can create a bubble map easily, and we can use the square root to make the circle\'s area proportional to the feature\'s property',

    'We can make them proportional to the scale too, to avoid not very attractive overlaps',

    'And... let\'s put a nice stroke',
    'Finally, we can use the new Windshaft aggregations, just use the aggregator functions: MIN, MAX, SUM, AVG and MODE',
];

const shipsStyle = 'width:    blend(1,2,near($day, (25*now()) %1000, 0, 10), cubic) *zoom()\ncolor:    setopacity(ramp(AVG($temp), tealrose, 0, 30), blend(0.005,1,near($day, (25*now()) %1000, 0, 10), cubic))';

const BASEMAPS = {
    DarkMatter: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    Voyager: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    Positron: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
};

var basemap = 'DarkMatter';
var mapboxgl = window.mapboxgl;
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: BASEMAPS[basemap], // stylesheet location
    center: [2.17, 41.38], // starting position [lng, lat]
    zoom: 13, // starting zoom,
});

const auth = {
    user: 'dmanzanares',
    apiKey: 'YOUR_API_KEY'
};
const source = new carto.source.Dataset('ne_10m_populated_places_simple', auth);
const style = new carto.Style();
const layer = new carto.Layer('myCartoLayer', source, style);
layer.addTo(map, 'watername_ocean');

setInterval(() => {
    document.getElementById('title').innerText = `Demo dataset  ~ ${layer.getNumFeatures()} features`;
}, 500)

map.on('load', () => {
    let index = 0;//styles.length - 1;

    function updateStyle(v) {
        v = v || document.getElementById('styleEntry').value;
        document.getElementById('styleEntry').value = v;
        location.hash = getConfig();
        try {
            layer.setStyle(new carto.Style(v));
            document.getElementById('feedback').style.display = 'none';
        } catch (error) {
            const err = `Invalid style: ${error}:${error.stack}`;
            console.warn(err);
            document.getElementById('feedback').value = err;
            document.getElementById('feedback').style.display = 'block';
        }
    }

    function barcelona() {
        $('.step').css('display', 'inline');
        $('#styleEntry').removeClass('twelve columns').addClass('eight columns');
        $('#tutorial').text(texts[index]);

        $('#dataset').val('tx_0125_copy_copy');
        $('#user').val('cartogl');
        $('#serverURL').val('https://{user}.carto.com');

        document.getElementById('styleEntry').value = styles[index];
        superRefresh();
    }
    function wwi() {
        $('.step').css('display', 'none');
        $('#styleEntry').removeClass('eight columns').addClass('twelve columns');
        $('#tutorial').text('');

        $('#dataset').val('wwi');
        $('#user').val('cartogl');
        $('#serverURL').val('https://{user}.carto.com');

        document.getElementById('styleEntry').value = shipsStyle;
        superRefresh();
    }

    $('#prev').click(() => {
        $('#prev').attr('disabled', false);
        $('#next').attr('disabled', false);
        if (index > 0) {
            index--;
            $('#tutorial').text(texts[index]);
            updateStyle(styles[index]);
        }
        if (index == 0) {
            $('#prev').attr('disabled', true);
        }
    });
    $('#next').click(() => {
        $('#prev').attr('disabled', false);
        $('#next').attr('disabled', false);
        if (index < styles.length - 1) {
            index++;
            $('#tutorial').text(texts[index]);
            updateStyle(styles[index]);
        }
        if (index == styles.length - 1) {
            $('#next').prop('disabled', true);
        }
    });

    $('#barcelona').click(barcelona);
    $('#wwi').click(wwi);
    $('#styleEntry').on('input', () => updateStyle());
    function getConfig() {
        return '#' + btoa(JSON.stringify({
            a: $('#dataset').val(),
            b: '',
            c: $('#user').val(),
            d: $('#serverURL').val(),
            e: $('#styleEntry').val(),
            f: map.getCenter(),
            g: map.getZoom(),
        }));
    }
    function setConfig(input) {
        let c = JSON.parse(atob(input));
        if (c.c == 'dmanzanares-ded13') {
            c.c = 'cartogl';
            c.d = 'https://{user}.carto.com';
        }
        if (c.d == 'carto.com') {
            c.d = 'https://{user}.carto.com';
        }
        $('#dataset').val(c.a);
        $('#user').val(c.c);
        $('#serverURL').val(c.d);
        $('#styleEntry').val(c.e);
        superRefresh(true);
        map.setZoom(c.g);
        map.setCenter(c.f);
        location.hash = getConfig();
    }

    const superRefresh = (nosave) => {
        if (nosave) {
            location.hash = getConfig();
        }
        layer.setSource(new carto.source.Dataset(
            $('#dataset').val(),
            {
                user: $('#user').val(),
                apiKey: 'YOUR_API_KEY'
            },
            {
                serverURL: $('#serverURL').val()
            }
        ));

        localStorage.setItem('serverURL', $('#serverURL').val());
        localStorage.setItem('user', $('#user').val());
        localStorage.setItem('dataset', $('#dataset').val());
        updateStyle();
    };


    $('#dataset').on('input', superRefresh);
    $('#user').on('input', superRefresh);
    $('#serverURL').on('input', superRefresh);

    const addButton = (name, code) => {
        var button = document.createElement('button');
        button.innerText = name;
        button.onclick = () => {
            $('.step').css('display', 'none');
            $('#styleEntry').removeClass('eight columns').addClass('twelve columns');
            $('#tutorial').text('');
            setConfig(code);
        };
        document.getElementById('buttonlist').appendChild(button);
    };
    addButton('WWI ships', 'eyJhIjoid3dpIiwiYiI6IiIsImMiOiJjYXJ0b2dsIiwiZCI6ImNhcnRvLmNvbSIsImUiOiJ3aWR0aDogICAgYmxlbmQoMSwyLG5lYXIoJGRheSwgKDI1Km5vdygpKSAlMTAwMCwgMCwgMTApLCBjdWJpYykgKnpvb20oKVxuY29sb3I6ICAgIHNldG9wYWNpdHkocmFtcChsaW5lYXIoQVZHKCR0ZW1wKSwgMCwzMCksIHRlYWxyb3NlKSwgYmxlbmQoMC4wMDUsMSxuZWFyKCRkYXksICgyNSpub3coKSkgJTEwMDAsIDAsIDEwKSwgY3ViaWMpKSIsImYiOnsibG5nIjo2MC40MTM2MTE2NzUzMTc3MjUsImxhdCI6MjMuMjIxNzQzODQ0NzQ2Mjg1fSwiZyI6MS41NTE5NTk3NzkwMjk0MTQ2fQ==');
    addButton('Butterfly migrations', 'eyJhIjoibW9uYXJjaF9taWdyYXRpb25fMSIsImIiOiIiLCJjIjoibWFtYXRhYWtlbGxhIiwiZCI6ImNhcnRvLmNvbSIsImUiOiJ3aWR0aDogc3FydCgkbnVtYmVyLzEwKVxuY29sb3I6IHNldE9wYWNpdHkocmFtcChNQVgoJG51bWJlcileMC41LCBTdW5zZXQsIDAsIDUwKSwwLjcpXG5zdHJva2VDb2xvcjogcmFtcChNQVgoJG51bWJlcileMC41LCBTdW5zZXQsIDAsIDUwKVxuc3Ryb2tlV2lkdGg6IDFcblxuXG5cblxuXG4iLCJmIjp7ImxuZyI6LTg3LjUyMDYzMDE3NjQwMzk4LCJsYXQiOjM3LjM3NzY5OTc2NjUzOTMxfSwiZyI6Mi43NDY1OTQ2MTU2NjYxODl9');
    addButton('Non-white', 'eyJhIjoidGFibGVfNXlyX2NvdW50eV9hY3NfY29weV8xIiwiYiI6IiIsImMiOiJtYW1hdGFha2VsbGEiLCJkIjoiY2FydG8uY29tIiwiZSI6IndpZHRoOiAoJGFzaWFuX3BvcCskYmxhY2tfcG9wKyRoaXNwYW5pY19vKS8kd2hpdGVfcG9wXG5jb2xvcjogc2V0T3BhY2l0eShoc3YoMC41LDEsMSksMC43KSIsImYiOnsibG5nIjotOTAuNjk5MDU4NTEyNDExOTcsImxhdCI6NDAuNjIxNDc1MjM0NDE2NjY0fSwiZyI6Mi40NTczMzYwNjQyMjM1MzF9');
    addButton('Denver accidents',
        'eyJhIjoidHJhZmZpY19hY2NpZGVudHNfY29weSIsImIiOiIiLCJjIjoibWFtYXRhYWtlbGxhIiwiZCI6ImNhcnRvLmNvbSIsImUiOiJ3aWR0aDogICAkY291bnQvMlxuY29sb3I6IHNldE9wYWNpdHkocmFtcCgkY291bnQsIFJlZE9yLDAsMTIwKSwoJGNvdW50LzIpLzEwKVxuXG5cbiIsImYiOnsibG5nIjotMTA0Ljk2NTA1NjIxNTY2NzQ2LCJsYXQiOjM5Ljc0OTYxOTM3ODI0NjIyfSwiZyI6MTEuNDE4NzE4NzcwOTA0NDk0fQ==');
    addButton('California Wildfires by acreage', 'eyJhIjoiZmlyZV9wZXJpbWV0ZXJzX2NvcHkiLCJiIjoiIiwiYyI6Im1hbWF0YWFrZWxsYSIsImQiOiJjYXJ0by5jb20iLCJlIjoid2lkdGg6ICAgJGdpc19hY3Jlcy8xMDAwMFxuY29sb3I6IHJnYmEoMjU1LDI1NSwyNTUsMClcbnN0cm9rZUNvbG9yOiAgaHN2KDAuMSwgJGdpc19hY3Jlcy8yMDAwMDAsICRnaXNfYWNyZXMvNDAwMDAwKVxuc3Ryb2tlV2lkdGg6ICRnaXNfYWNyZXMvNTAwMDBcblxuXG5cbiIsImYiOnsibG5nIjotMTE2LjIxMzg3ODM2NjMyNjM2LCJsYXQiOjM4LjA3Mjc4MzE4ODM2MTk0fSwiZyI6NS4xODExODk4NjE2NTIxODZ9');
    addButton('California Wildfires size/opacity by acres burned colored by cause ',
        'eyJhIjoiZmlyZV9wZXJpbWV0ZXJzX2NvcHkiLCJiIjoiIiwiYyI6Im1hbWF0YWFrZWxsYSIsImQiOiJjYXJ0by5jb20iLCJlIjoid2lkdGg6ICRnaXNfYWNyZXMvMTAwMDBcbmNvbG9yOiBzZXRPcGFjaXR5KHJhbXAoJGNhdXNlLFByaXNtLDEsMTQpLCRnaXNfYWNyZXMvMTAwMDAwKVxuXG5cblxuXG4iLCJmIjp7ImxuZyI6LTExNS42MjczMzQwNjUyOTMxLCJsYXQiOjQxLjIwNTkwODAyMDYzNDM1NH0sImciOjMuOTIzMjMyOTY0MzM3MzU3Nn0=');
    addButton('Population Density - Filtering & Buckets', 'eyJhIjoicG9wX2RlbnNpdHlfcG9pbnRzIiwiYiI6IiIsImMiOiJtYW1hdGFha2VsbGEiLCJkIjoiY2FydG8uY29tIiwiZSI6IndpZHRoOiB6b29tKClcbmNvbG9yOiByYW1wKGJ1Y2tldHMoJGRuLCA4MCwgMTAwLCAxNDApLCBwcmlzbSkqZ3JlYXRlclRoYW4oJGRuLCA2MClcblxuXG5cbiIsImYiOnsibG5nIjotMTAuODQwNzIxNDAxNDUzMjY2LCJsYXQiOjQwLjA2NDA1NDE1NjU3MDk2fSwiZyI6MS40OTE3MDE3MTg1OTc1MzI1fQ==');
    addButton('Commuters who travel outside home county for work', 'eyJhIjoiY29tbXV0ZXJfZmxvd19ieV9jb3VudHlfNSIsImIiOiIiLCJjIjoibWFtYXRhYWtlbGxhIiwiZCI6ImNhcnRvLmNvbSIsImUiOiJ3aWR0aDogKCR3b3JrZXJzX2luX2Zsb3cvMjkwMzQ2MSoxMDApKjRcbmNvbG9yOiBzZXRPcGFjaXR5KHJhbXAoJHdvcmtlcnNfaW5fZmxvdyxhZ19Hcm5ZbCwwLDEwMDAwMCksKCRyZXNpZGVuY2VfZmlwc19jb25jYXQtJHdvcmtfZmlwc19jb25jYXQpKVxuXG5cblxuXG5cblxuIiwiZiI6eyJsbmciOi05NS45OTY1MzU1NDYxNTc5OSwibGF0IjozNC40NDM5MjMyNDc4NzUwMzR9LCJnIjoyLjYzODUyMzM4NDkxNjQ3NTh9');
    addButton('Ethnic', 'eyJhIjoidGFibGVfNXlyX2NvdW50eV9hY3NfY29weV8xIiwiYiI6IiIsImMiOiJtYW1hdGFha2VsbGEiLCJkIjoiY2FydG8uY29tIiwiZSI6IndpZHRoOiBzcXJ0KHN1bSgkYXNpYW5fcG9wKStzdW0oJGJsYWNrX3BvcCkrc3VtKCRoaXNwYW5pY19vKStzdW0oJHdoaXRlX3BvcCkpLzQwMCp6b29tKClcbmNvbG9yOiBzZXRvcGFjaXR5KGhzdigwLiwxLDEpKnN1bSgkYmxhY2tfcG9wKS8oc3VtKCRhc2lhbl9wb3ApK3N1bSgkYmxhY2tfcG9wKStzdW0oJGhpc3BhbmljX28pK3N1bSgkd2hpdGVfcG9wKSkqMStcbiAgICAgICAgICAgIGhzdigwLjY2LDEsMSkqc3VtKCRhc2lhbl9wb3ApLyhzdW0oJGFzaWFuX3BvcCkrc3VtKCRibGFja19wb3ApK3N1bSgkaGlzcGFuaWNfbykrc3VtKCR3aGl0ZV9wb3ApKSozK1xuICAgICAgICAgICAgaHN2KDAuMzMsMSwxKSpzdW0oJGhpc3BhbmljX28pLyhzdW0oJGFzaWFuX3BvcCkrc3VtKCRibGFja19wb3ApK3N1bSgkaGlzcGFuaWNfbykrc3VtKCR3aGl0ZV9wb3ApKSoxK1xuICAgICAgICAgICAgaHN2KDAuMTUsMCwxKSpzdW0oJHdoaXRlX3BvcCkvKHN1bSgkYXNpYW5fcG9wKStzdW0oJGJsYWNrX3BvcCkrc3VtKCRoaXNwYW5pY19vKStzdW0oJHdoaXRlX3BvcCkpKjAuOCwgMC44KVxuc3Ryb2tlQ29sb3I6IHJnYmEoMCwwLDAsMS4pXG5zdHJva2VXaWR0aDogMVxucmVzb2x1dGlvbjogNCIsImYiOnsibG5nIjotOTcuNTYzMjU1MjU1NzM2NjksImxhdCI6NDEuMDE3NzE5NjEzMTAyMjl9LCJnIjo0LjA0NjgwODgwMTM4OTk4ODZ9');
    addButton('Pluto', 'eyJhIjoibW5tYXBwbHV0byIsImIiOiIiLCJjIjoiZG1hbnphbmFyZXMiLCJkIjoiY2FydG8uY29tIiwiZSI6ImNvbG9yOiByYW1wKGxpbmVhcihsb2coJG51bWZsb29ycyksIDEsIDQpLCBFYXJ0aClcbiIsImYiOnsibG5nIjotNzMuOTA0MzkwOTA1NTU1NDMsImxhdCI6NDAuNzQ5MTE4Nzc2NDIxNH0sImciOjExLjc0ODMxNjMyODkxMDYyMn0=');
    addButton('SF Lines', 'eyJhIjoic2Zfc3RjbGluZXMiLCJiIjoiIiwiYyI6ImRtYW56YW5hcmVzIiwiZCI6ImNhcnRvLmNvbSIsImUiOiJjb2xvcjogcmFtcCgkc3RfdHlwZSwgcHJpc20pIFxud2lkdGg6IDEuNSIsImYiOnsibG5nIjotMTIyLjQ0NDA4NDg2ODYxMTkyLCJsYXQiOjM3Ljc3MzcwNjczNjE0OTcwNX0sImciOjExLjY2NDMxMDgwMjg2NjgwNX0=');
    addButton('Gecat', 'eyJhIjoiKHNlbGVjdCAqLCAxIGFzIGNvIGZyb20gZ2VjYXRfZ2VvZGF0YV9jb3B5KSBBUyB0bXAiLCJiIjoiIiwiYyI6ImNkYnNvbC1hZG1pbiIsImQiOiJjYXJ0by5jb20iLCJlIjoiY29sb3I6IHNldG9wYWNpdHkocmFtcChsb2coYXZnKCRzcGVlZCkpLCBHZXlzZXIsIDAsIDQpLCAgc3VtKCRjbykqem9vbSgpLzEwMDAwMCoxLjgqNClcbndpZHRoOiAyXG5yZXNvbHV0aW9uOiAwLjI1ICIsImYiOnsibG5nIjoxLjI2MTY3OTI2Njk1NDg0MzEsImxhdCI6NDEuNzA0MTA0OTc0OTIwNDU1fSwiZyI6Ny4zNDY1Mzk0OTc2MDMwNH0=');
    addButton('BC Category filtering', 'eyJhIjoidHhfMDEyNV9jb3B5X2NvcHkiLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiY2FydG8uY29tIiwiZSI6IndpZHRoOiBzcXJ0KFNVTSgkYW1vdW50KS81MDAwMCkqMjAqKHpvb20oKS80MDAwKzAuMDEpKjEuNSpcbihlcXVhbHMoTU9ERSgkY2F0ZWdvcnkpLCBcIlRyYW5zcG9ydGVzXCIpICsgZXF1YWxzKE1PREUoJGNhdGVnb3J5KSwgXCJTYWx1ZFwiKSApXG5jb2xvcjogcmFtcChNT0RFKCRjYXRlZ29yeSksIFByaXNtKSIsImYiOnsibG5nIjoyLjE2NTg1ODg5NzAwMjc0OTUsImxhdCI6NDEuMzcwNTUyMDgwOTQzODd9LCJnIjoxMS42ODgyNTMxODcyMzgxOTh9');

    if (localStorage.getItem('dataset')) {
        $('#dataset').val(localStorage.getItem('dataset'));
        $('#user').val(localStorage.getItem('user'));
        $('#serverURL').val(localStorage.getItem('serverURL'));
    }
    if (location.hash.length > 1) {
        setConfig(location.hash.substring(1));
    } else {
        barcelona();
    }
});

const basemapSelector = document.querySelector('#basemap');
Object.keys(BASEMAPS).forEach(id => {
    const l = document.createElement('label');

    const i = document.createElement('input');
    i.type = 'radio';
    i.name = 'basemap';
    i.value = id;
    i.onclick = () => {
        map.setStyle(BASEMAPS[id]);
        let added = false;
        map.on('sourcedata', event => {
            if (map.isStyleLoaded() && !added) {
                layer.addTo(map, 'watername_ocean');
                added = true;
            }
        });
    };
    i.selected = 'selected';
    l.appendChild(i);

    const s = document.createElement('span');
    s.innerText = id;
    l.appendChild(s);

    basemapSelector.appendChild(l);
});
