/* global carto */
/*eslint-env jquery*/
/*eslint no-console: ["off"] */

const styles = [
    `width: 3
color: rgb(204,0,0)`,

    `width: 3
color: rgba(204,0,0,0.2)`,

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
color: opacity( ramp($category, Prism), $amount/5000)`,

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

const shipsStyle = 'width:    blend(1,2,near($day, (25*now()) %1000, 0, 10), cubic) *zoom()\ncolor:    opacity(ramp(AVG($temp), tealrose, 0, 30), blend(0.005,1,near($day, (25*now()) %1000, 0, 10), cubic))';

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
    dragRotate: false // disable drag to rotate handling
});

const auth = {
    user: 'dmanzanares',
    apiKey: 'YOUR_API_KEY'
};

let layer = null;
setInterval(() => {
    if (layer) {
        document.getElementById('title').innerText = `~ ${layer.getNumFeatures()} features`;
    }
}, 500);

map.on('zoom', event => document.querySelector('.map-info').innerText = `zoom: ${map.getZoom()}`);

map.on('load', () => {
    document.querySelector('.map-info').innerText = `zoom: ${map.getZoom()}`;
    let index = 0;//styles.length - 1;

    function handleError(error) {
        const err = `Invalid style: ${error}:${error.stack}`;
        console.warn(err);
        document.getElementById('feedback').value = err;
        document.getElementById('feedback').style.display = 'block';
    }
    function updateStyle(v) {
        v = v || document.getElementById('styleEntry').value;
        document.getElementById('styleEntry').value = v;
        location.hash = getConfig();
        try {
            const promise = layer.blendToStyle(new carto.Style(v));
            document.getElementById('feedback').style.display = 'none';
            if (promise) {
                promise.catch(handleError);
            }
        } catch (error) {
            handleError(error);
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
        const SourceClass = $('#dataset').val().toLowerCase().includes('select') ? carto.source.SQL : carto.source.Dataset;
        const source = new SourceClass(
            $('#dataset').val(),
            {
                user: $('#user').val(),
                apiKey: 'YOUR_API_KEY'
            },
            {
                serverURL: $('#serverURL').val()
            }
        );
        const styleStr = document.getElementById('styleEntry').value;
        const style = new carto.Style(styleStr);
        if (!layer) {
            layer = new carto.Layer('myCartoLayer', source, style);
            layer.addTo(map, 'watername_ocean');
        } else {
            layer.update(source, style);
        }
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
    addButton('WWI ships', 'eyJhIjoid3dpIiwiYiI6IiIsImMiOiJjYXJ0b2dsIiwiZCI6Imh0dHBzOi8ve3VzZXJ9LmNhcnRvLmNvbSIsImUiOiJ3aWR0aDogICAgem9vbSgpICogKHRvcnF1ZSgkZGF5LCAxNDAsIGZhZGUoMC4wNSwgMC4yKSkgKyAwLjUpXG5jb2xvcjogICAgIHJhbXAobGluZWFyKEFWRygkdGVtcCksIDAsMzApLCB0ZWFscm9zZSlcbmZpbHRlcjogICAgICB0b3JxdWUoJGRheSwgMTQwLCBmYWRlKDAuMDUsIDAuMikpICsgMC4wNSIsImYiOnsibG5nIjo3Mi42OTY3MDEyMjkzNjQ3NSwibGF0IjoyNy4wMjgwNjIyOTcyNzc5NH0sImciOjEuMTk3MjI5MjYwOTc2ODM3OH0=');
    addButton('Butterfly migrations', 'eyJhIjoibW9uYXJjaF9taWdyYXRpb25fMSIsImIiOiIiLCJjIjoibWFtYXRhYWtlbGxhIiwiZCI6Imh0dHBzOi8ve3VzZXJ9LmNhcnRvLmNvbSIsImUiOiJ3aWR0aDogc3FydCgkbnVtYmVyLzEwKVxuY29sb3I6IG9wYWNpdHkocmFtcChsaW5lYXIoTUFYKCRudW1iZXIpXjAuNSwgMCwgNTApLCBTdW5zZXQpLDAuNylcbnN0cm9rZUNvbG9yOiByYW1wKGxpbmVhcihNQVgoJG51bWJlcileMC41LDAsIDUwKSwgU3Vuc2V0KVxuc3Ryb2tlV2lkdGg6IDFcblxuXG5cblxuXG4iLCJmIjp7ImxuZyI6LTg3LjUyMDYzMDE3NjQwMzk4LCJsYXQiOjM3LjM3NzY5OTc2NjUzOTMxfSwiZyI6Mi43NDY1OTQ2MTU2NjYxODl9');
    addButton('Non-white', 'eyJhIjoidGFibGVfNXlyX2NvdW50eV9hY3NfY29weV8xIiwiYiI6IiIsImMiOiJtYW1hdGFha2VsbGEiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiAoJGFzaWFuX3BvcCskYmxhY2tfcG9wKyRoaXNwYW5pY19vKS8kd2hpdGVfcG9wXG5jb2xvcjogaHN2YSgwLjUsIDEsIDEsIDAuNykiLCJmIjp7ImxuZyI6LTkwLjY5OTA1ODUxMjQxMTk3LCJsYXQiOjQwLjYyMTQ3NTIzNDQxNjY2NH0sImciOjIuNDU3MzM2MDY0MjIzNTMxfQ==');
    addButton('Denver accidents',
        'eyJhIjoidHJhZmZpY19hY2NpZGVudHNfY29weSIsImIiOiIiLCJjIjoibWFtYXRhYWtlbGxhIiwiZCI6Imh0dHBzOi8ve3VzZXJ9LmNhcnRvLmNvbSIsImUiOiJ3aWR0aDogICAkY291bnQvMlxuY29sb3I6IG9wYWNpdHkoIHJhbXAobGluZWFyKCRjb3VudCwgMCwxMjApLCBSZWRPciksICRjb3VudC8yMClcblxuXG4iLCJmIjp7ImxuZyI6LTEwNC45NjUwNTYyMTU2Njc0NiwibGF0IjozOS43NDk2MTkzNzgyNDYyMn0sImciOjExLjQxODcxODc3MDkwNDQ5NH0=');
    addButton('California Wildfires by acreage', 'eyJhIjoiZmlyZV9wZXJpbWV0ZXJzX2NvcHkiLCJiIjoiIiwiYyI6Im1hbWF0YWFrZWxsYSIsImQiOiJodHRwczovL3t1c2VyfS5jYXJ0by5jb20iLCJlIjoid2lkdGg6ICAgJGdpc19hY3Jlcy8xMDAwMFxuY29sb3I6IHJnYmEoMCwwLDAsMClcbnN0cm9rZUNvbG9yOiAgaHN2KDAuMSwgJGdpc19hY3Jlcy8yMDAwMDAsICRnaXNfYWNyZXMvNDAwMDAwKVxuc3Ryb2tlV2lkdGg6ICRnaXNfYWNyZXMvNTAwMDAiLCJmIjp7ImxuZyI6LTExNi4yMTM4NzgzNjYzMjYzNiwibGF0IjozOC4wNzI3ODMxODgzNjE5NH0sImciOjUuMTgxMTg5ODYxNjUyMTg2fQ==');
    addButton('California Wildfires size/opacity by acres burned colored by cause ',
        'eyJhIjoiZmlyZV9wZXJpbWV0ZXJzX2NvcHkiLCJiIjoiIiwiYyI6Im1hbWF0YWFrZWxsYSIsImQiOiJodHRwczovL3t1c2VyfS5jYXJ0by5jb20iLCJlIjoid2lkdGg6ICRnaXNfYWNyZXMvMTAwMDBcbmNvbG9yOiBvcGFjaXR5KHJhbXAobGluZWFyKCRjYXVzZSwgMSwxNCksIFByaXNtKSwkZ2lzX2FjcmVzLzEwMDAwMClcblxuXG5cblxuIiwiZiI6eyJsbmciOi0xMTUuNjI3MzM0MDY1MjkzMSwibGF0Ijo0MS4yMDU5MDgwMjA2MzQzNTR9LCJnIjozLjkyMzIzMjk2NDMzNzM1NzZ9');
    addButton('Population Density - Filtering & Buckets', 'eyJhIjoicG9wX2RlbnNpdHlfcG9pbnRzIiwiYiI6IiIsImMiOiJtYW1hdGFha2VsbGEiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiB6b29tKClcbmNvbG9yOiByYW1wKGJ1Y2tldHMoJGRuLCA4MCwgMTAwLCAxNDApLCBwcmlzbSlcbmZpbHRlcjogJGRuID4gNjBcblxuXG5cbiIsImYiOnsibG5nIjotMTAuODQwNzIxNDAxNDUzMjY2LCJsYXQiOjQwLjA2NDA1NDE1NjU3MDk2fSwiZyI6MS40OTE3MDE3MTg1OTc1MzI1fQ==');
    addButton('Commuters who travel outside home county for work', 'eyJhIjoiY29tbXV0ZXJfZmxvd19ieV9jb3VudHlfNSIsImIiOiIiLCJjIjoibWFtYXRhYWtlbGxhIiwiZCI6Imh0dHBzOi8ve3VzZXJ9LmNhcnRvLmNvbSIsImUiOiJ3aWR0aDogJHdvcmtlcnNfaW5fZmxvdy8yOTAzNDYxKjEwMCo0XG5jb2xvcjogb3BhY2l0eShyYW1wKGxpbmVhcigkd29ya2Vyc19pbl9mbG93LDAsMTAwMDAwKSAsYWdfR3JuWWwpLCAkcmVzaWRlbmNlX2ZpcHNfY29uY2F0LSR3b3JrX2ZpcHNfY29uY2F0KVxuXG5cblxuXG5cblxuIiwiZiI6eyJsbmciOi05NS45OTY1MzU1NDYxNTc5OSwibGF0IjozNC40NDM5MjMyNDc4NzUwMzR9LCJnIjoyLjYzODUyMzM4NDkxNjQ3NTh9');
    addButton('Ethnic', 'eyJhIjoidGFibGVfNXlyX2NvdW50eV9hY3NfY29weV8xIiwiYiI6IiIsImMiOiJtYW1hdGFha2VsbGEiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiBzcXJ0KHN1bSgkYXNpYW5fcG9wKStzdW0oJGJsYWNrX3BvcCkrc3VtKCRoaXNwYW5pY19vKStzdW0oJHdoaXRlX3BvcCkpLzQwMCp6b29tKClcbmNvbG9yOiBvcGFjaXR5KGhzdigwLiwxLDEpKnN1bSgkYmxhY2tfcG9wKS8oc3VtKCRhc2lhbl9wb3ApK3N1bSgkYmxhY2tfcG9wKStzdW0oJGhpc3BhbmljX28pK3N1bSgkd2hpdGVfcG9wKSkqMStcbiAgICAgICAgICAgIGhzdigwLjY2LDEsMSkqc3VtKCRhc2lhbl9wb3ApLyhzdW0oJGFzaWFuX3BvcCkrc3VtKCRibGFja19wb3ApK3N1bSgkaGlzcGFuaWNfbykrc3VtKCR3aGl0ZV9wb3ApKSozK1xuICAgICAgICAgICAgaHN2KDAuMzMsMSwxKSpzdW0oJGhpc3BhbmljX28pLyhzdW0oJGFzaWFuX3BvcCkrc3VtKCRibGFja19wb3ApK3N1bSgkaGlzcGFuaWNfbykrc3VtKCR3aGl0ZV9wb3ApKSoxK1xuICAgICAgICAgICAgaHN2KDAuMTUsMCwxKSpzdW0oJHdoaXRlX3BvcCkvKHN1bSgkYXNpYW5fcG9wKStzdW0oJGJsYWNrX3BvcCkrc3VtKCRoaXNwYW5pY19vKStzdW0oJHdoaXRlX3BvcCkpKjAuOCwgMC44KVxuc3Ryb2tlQ29sb3I6IHJnYigwLDAsMC4pXG5zdHJva2VXaWR0aDogMVxucmVzb2x1dGlvbjogNCIsImYiOnsibG5nIjotOTcuNTYzMjU1MjU1NzM2NjksImxhdCI6NDEuMDE3NzE5NjEzMTAyMjl9LCJnIjo0LjA0NjgwODgwMTM4OTk4ODZ9');
    addButton('Pluto', 'eyJhIjoibW5tYXBwbHV0byIsImIiOiIiLCJjIjoiZG1hbnphbmFyZXMiLCJkIjoiY2FydG8uY29tIiwiZSI6ImNvbG9yOiByYW1wKGxpbmVhcihsb2coJG51bWZsb29ycyksIDEsIDQpLCBFYXJ0aClcbiIsImYiOnsibG5nIjotNzMuOTA0MzkwOTA1NTU1NDMsImxhdCI6NDAuNzQ5MTE4Nzc2NDIxNH0sImciOjExLjc0ODMxNjMyODkxMDYyMn0=');
    addButton('Pluto - filtered', 'eyJhIjoibW5tYXBwbHV0byIsImIiOiIiLCJjIjoiZG1hbnphbmFyZXMiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6ImNvbG9yOiByYW1wKGxpbmVhcihsb2coJG51bWZsb29ycyksIDIsIDQpLCB0ZW1wcylcbmZpbHRlcjogYmV0d2VlbigkbnVtZmxvb3JzLCAxMCwgMTIwKSIsImYiOnsibG5nIjotNzMuOTgzNTMzNDQzODA2MzIsImxhdCI6NDAuNzQ3OTc2NzUxMzI3fSwiZyI6MTIuNTYyOTM2MzA1NDQ4NjgyfQ==');
    addButton('SF Lines', 'eyJhIjoic2Zfc3RjbGluZXMiLCJiIjoiIiwiYyI6ImRtYW56YW5hcmVzIiwiZCI6ImNhcnRvLmNvbSIsImUiOiJjb2xvcjogcmFtcCgkc3RfdHlwZSwgcHJpc20pIFxud2lkdGg6IDEuNSIsImYiOnsibG5nIjotMTIyLjQ0NDA4NDg2ODYxMTkyLCJsYXQiOjM3Ljc3MzcwNjczNjE0OTcwNX0sImciOjExLjY2NDMxMDgwMjg2NjgwNX0=');
    addButton('Gecat', 'eyJhIjoic2VsZWN0ICosIDEgYXMgY28gZnJvbSBnZWNhdF9nZW9kYXRhX2NvcHkiLCJiIjoiIiwiYyI6ImNkYnNvbC1hZG1pbiIsImQiOiJodHRwczovL3t1c2VyfS5jYXJ0by5jb20iLCJlIjoiY29sb3I6IG9wYWNpdHkocmFtcChsaW5lYXIobG9nKGF2Zygkc3BlZWQpKSwgMCwgNCksIEdleXNlciksICBzdW0oJGNvKSp6b29tKCkvMTAwMDAwKjEuOCo0KVxud2lkdGg6IDJcbnJlc29sdXRpb246IDAuMjUgIiwiZiI6eyJsbmciOjEuMjYxNjc5MjY2OTU0ODQzMSwibGF0Ijo0MS43MDQxMDQ5NzQ5MjA0NTV9LCJnIjo3LjM0NjUzOTQ5NzYwMzA0fQ==');
    addButton('BC Category filtering', 'eyJhIjoidHhfMDEyNV9jb3B5X2NvcHkiLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiBzcXJ0KFNVTSgkYW1vdW50KS81MDAwMCkqMjAqKHpvb20oKS80MDAwKzAuMDEpKjEuNVxuY29sb3I6IHJhbXAoTU9ERSgkY2F0ZWdvcnkpLCBQcmlzbSlcbmZpbHRlcjogTU9ERSgkY2F0ZWdvcnkpID09IFwiVHJhbnNwb3J0ZXNcIiAgICBvciAgIE1PREUoJGNhdGVnb3J5KSA9PSBcIlNhbHVkXCIiLCJmIjp7ImxuZyI6Mi4xNjU4NTg4OTcwMDI3NDk1LCJsYXQiOjQxLjM3MDU1MjA4MDk0Mzg3fSwiZyI6MTEuNjg4MjUzMTg3MjM4MTk4fQ==');

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
    i.checked = id === basemap;
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

document.getElementById('fullscreen').onclick = () => {
    document.getElementById('mapDiv').style.height = '100%';
    document.body.style.overflow = 'hidden';
    document.querySelector('.map-info').style.display = 'none';
    map.resize();
};
