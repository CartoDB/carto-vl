/* global carto */
/*eslint-env jquery*/
/*eslint no-console: ["off"] */

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

    `width: sqrt(clusterSum('amount')/50000)*20*(zoom()/4000+0.01)*1.5
color: ramp(clusterMode('category'), PRISM)
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
    'Finally, we can use the new Windshaft aggregations, just use the aggregator functions: clusterMin, clusterMax, clusterSum, clusterAvg and clusterMode',
];

const BASEMAPS = {
    DarkMatter: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    Voyager: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    Positron: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
};
const DEFAULT_BASEMAP = 'DarkMatter';

var basemap = DEFAULT_BASEMAP;
var mapboxgl = window.mapboxgl;
var map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [0, 0],
    zoom: 0,
    dragRotate: false // disable drag to rotate handling
});

let layer = null;
setInterval(() => {
    if (layer) {
        document.getElementById('title').innerText = `~ ${layer.getNumFeatures()} features`;
    }
}, 500);

map.on('zoom', () => document.querySelector('.map-info').innerText = `zoom: ${map.getZoom()}`);

map.on('load', () => {
    document.querySelector('.map-info').innerText = `zoom: ${map.getZoom()}`;
    let index = 0; //vizs.length - 1;

    function updateViz(v) {
        v = v || document.getElementById('styleEntry').value;
        document.getElementById('styleEntry').value = v;
        try {
            if (layer) {
                $('#loader').addClass('spin');
                document.getElementById('feedback').style.display = 'none';
                layer.blendToViz(new carto.Viz(v)).then(() => {
                    $('#loader').removeClass('spin');
                    saveConfig();
                }).catch(error => {
                    handleError(error);
                    $('#loader').removeClass('spin');
                });
            }
        } catch (error) {
            handleError(error);
            $('#loader').removeClass('spin');
        }
    }

    function barcelona() {
        $('.step').css('display', 'inline');
        $('#styleEntry').removeClass('twelve columns').addClass('eight columns');
        $('#tutorial').text(texts[index]);

        $('#dataset').val('tx_0125_copy_copy');
        $('#user').val('cartogl');
        $('#serverURL').val('https://{user}.carto.com');

        document.getElementById('styleEntry').value = vizs[index];
        superRefresh({ zoom: 13, center: [2.17, 41.38], basemap: 'DarkMatter' });
    }

    $('#prev').click(() => {
        $('#prev').attr('disabled', false);
        $('#next').attr('disabled', false);
        if (index > 0) {
            index--;
            $('#tutorial').text(texts[index]);
            updateViz(vizs[index]);
        }
        if (index == 0) {
            $('#prev').attr('disabled', true);
        }
    });
    $('#next').click(() => {
        $('#prev').attr('disabled', false);
        $('#next').attr('disabled', false);
        if (index < vizs.length - 1) {
            index++;
            $('#tutorial').text(texts[index]);
            updateViz(vizs[index]);
        }
        if (index == vizs.length - 1) {
            $('#next').prop('disabled', true);
        }
    });

    $('#barcelona').click(barcelona);
    $('#styleEntry').on('input', () => updateViz());

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
    addButton('WWI ships', 'eyJhIjoid3dpIiwiYiI6IiIsImMiOiJjYXJ0b2dsIiwiZCI6Imh0dHBzOi8ve3VzZXJ9LmNhcnRvLmNvbSIsImUiOiJ3aWR0aDogIHpvb20oKSAqICh0b3JxdWUoJGRheSwgMTQwLCBmYWRlKDAuMDUsIDAuMikpICsgMC41KVxuY29sb3I6ICByYW1wKGxpbmVhcihjbHVzdGVyQXZnKCd0ZW1wJyksIDAsMzApLCB0ZWFscm9zZSlcbnN0cm9rZVdpZHRoOiAwXG5maWx0ZXI6IHRvcnF1ZSgkZGF5LCAxNDAsIGZhZGUoMC4wNSwgMC4yKSkgKyAwLjA1IiwiZiI6eyJsbmciOjI0LjczNTU2ODUyMDQwMjkyLCJsYXQiOjE5LjE2MzQ3MDk3ODc1NDk0NH0sImciOjAuODQzODY2NDM5MjMxMjg0LCJoIjoiRGFya01hdHRlciJ9');
    addButton('Butterfly migrations', 'eyJhIjoibW9uYXJjaF9taWdyYXRpb25fMSIsImIiOiIiLCJjIjoibWFtYXRhYWtlbGxhIiwiZCI6Imh0dHBzOi8ve3VzZXJ9LmNhcnRvLmNvbSIsImUiOiJ3aWR0aDogc3FydCgkbnVtYmVyLzEwKVxuY29sb3I6IG9wYWNpdHkocmFtcChsaW5lYXIoY2x1c3Rlck1heCgnbnVtYmVyJyleMC41LCAwLCA1MCksIFN1bnNldCksMC43KVxuc3Ryb2tlQ29sb3I6IHJhbXAobGluZWFyKGNsdXN0ZXJNYXgoJ251bWJlcicpXjAuNSwwLCA1MCksIFN1bnNldClcbnN0cm9rZVdpZHRoOiAxXG5cblxuXG5cblxuIiwiZiI6eyJsbmciOi04Ny43MDk5NTMwNTA3MDgwMSwibGF0IjozNy4zNzAwNDk1OTk4OTM0MzR9LCJnIjoyLjgzNzc5MjUwMzYzMjU2NzUsImgiOiJEYXJrTWF0dGVyIn0=');
    addButton('Non-white', 'eyJhIjoidGFibGVfNXlyX2NvdW50eV9hY3NfY29weV8xIiwiYiI6IiIsImMiOiJtYW1hdGFha2VsbGEiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiAoJGFzaWFuX3BvcCskYmxhY2tfcG9wKyRoaXNwYW5pY19vKS8kd2hpdGVfcG9wXG5jb2xvcjogaHN2YSgwLjUsIDEsIDEsIDAuNylcbnN0cm9rZVdpZHRoOiAwIiwiZiI6eyJsbmciOi05MC42OTkwNTg1MTI0MTE5NywibGF0Ijo0MC42MjE0NzUyMzQ0MTY2NjR9LCJnIjoyLjQ1NzMzNjA2NDIyMzUzMSwiaCI6IkRhcmtNYXR0ZXIifQ==');
    addButton('Denver accidents',
        'eyJhIjoidHJhZmZpY19hY2NpZGVudHNfY29weSIsImIiOiIiLCJjIjoibWFtYXRhYWtlbGxhIiwiZCI6Imh0dHBzOi8ve3VzZXJ9LmNhcnRvLmNvbSIsImUiOiJ3aWR0aDogICAkY291bnQvMlxuY29sb3I6IG9wYWNpdHkoIHJhbXAobGluZWFyKCRjb3VudCwgMCwxMjApLCBSZWRPciksICRjb3VudC8yMClcbnN0cm9rZVdpZHRoOiAwXG5cblxuIiwiZiI6eyJsbmciOi0xMDQuOTY1MDU2MjE1NjY3NDYsImxhdCI6MzkuNzQ5NjE5Mzc4MjQ2MjJ9LCJnIjoxMS40MTg3MTg3NzA5MDQ0OTQsImgiOiJEYXJrTWF0dGVyIn0=');
    addButton('California Wildfires by acreage', 'eyJhIjoiZmlyZV9wZXJpbWV0ZXJzX2NvcHkiLCJiIjoiIiwiYyI6Im1hbWF0YWFrZWxsYSIsImQiOiJodHRwczovL3t1c2VyfS5jYXJ0by5jb20iLCJlIjoid2lkdGg6ICAgJGdpc19hY3Jlcy8xMDAwMFxuY29sb3I6IHJnYmEoMCwwLDAsMClcbnN0cm9rZUNvbG9yOiAgaHN2KDAuMSwgJGdpc19hY3Jlcy8yMDAwMDAsICRnaXNfYWNyZXMvNDAwMDAwKVxuc3Ryb2tlV2lkdGg6ICRnaXNfYWNyZXMvNTAwMDAiLCJmIjp7ImxuZyI6LTExNi4yMTM4NzgzNjYzMjYzNiwibGF0IjozOC4wNzI3ODMxODgzNjE5NH0sImciOjUuMTgxMTg5ODYxNjUyMTg2fQ==');
    addButton('California Wildfires size/opacity by acres burned colored by cause ',
        'eyJhIjoiZmlyZV9wZXJpbWV0ZXJzX2NvcHkiLCJiIjoiIiwiYyI6Im1hbWF0YWFrZWxsYSIsImQiOiJodHRwczovL3t1c2VyfS5jYXJ0by5jb20iLCJlIjoid2lkdGg6ICRnaXNfYWNyZXMvMTAwMDBcbmNvbG9yOiBvcGFjaXR5KHJhbXAobGluZWFyKCRjYXVzZSwgMSwxNCksIFByaXNtKSwkZ2lzX2FjcmVzLzEwMDAwMClcbnN0cm9rZVdpZHRoOiAwXG5cblxuXG5cbiIsImYiOnsibG5nIjotMTE5LjY3MzA3NjMzNzkwNDgzLCJsYXQiOjM3LjQ3ODE1Mjg2ODA2NzU1fSwiZyI6NC45NDY5MTE0NDI1NTk3MTMsImgiOiJEYXJrTWF0dGVyIn0=');
    addButton('Population Density - Filtering & Buckets', 'eyJhIjoicG9wX2RlbnNpdHlfcG9pbnRzIiwiYiI6IiIsImMiOiJtYW1hdGFha2VsbGEiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiB6b29tKClcbmNvbG9yOiByYW1wKGJ1Y2tldHMoJGRuLCBbODAsIDEwMCwgMTQwXSksIHByaXNtKVxuc3Ryb2tlV2lkdGg6IDBcbmZpbHRlcjogJGRuID4gNjBcblxuXG5cbiIsImYiOnsibG5nIjoyMy40NTMwMTgxOTIzNzI2MSwibGF0IjoxMS4yMzk5NTYwNjg2NDAxNTR9LCJnIjoxLjM1NTk2MDUzMDY0MTEzNzMsImgiOiJEYXJrTWF0dGVyIn0=');
    addButton('Commuters who travel outside home county for work', 'eyJhIjoiY29tbXV0ZXJfZmxvd19ieV9jb3VudHlfNSIsImIiOiIiLCJjIjoibWFtYXRhYWtlbGxhIiwiZCI6Imh0dHBzOi8ve3VzZXJ9LmNhcnRvLmNvbSIsImUiOiJ3aWR0aDogJHdvcmtlcnNfaW5fZmxvdy8yOTAzNDYxKjEwMCo0XG5jb2xvcjogb3BhY2l0eShyYW1wKGxpbmVhcigkd29ya2Vyc19pbl9mbG93LDAsMTAwMDAwKSAsYWdfR3JuWWwpLCAkcmVzaWRlbmNlX2ZpcHNfY29uY2F0LSR3b3JrX2ZpcHNfY29uY2F0KVxuc3Ryb2tlV2lkdGg6IDBcblxuXG5cblxuXG5cbiIsImYiOnsibG5nIjotOTUuOTk2NTM1NTQ2MTU3OTksImxhdCI6MzQuNDQzOTIzMjQ3ODc1MDM0fSwiZyI6Mi42Mzg1MjMzODQ5MTY0NzU4LCJoIjoiRGFya01hdHRlciJ9');
    addButton('Ethnic', 'eyJhIjoidGFibGVfNXlyX2NvdW50eV9hY3NfY29weV8xIiwiYiI6IiIsImMiOiJtYW1hdGFha2VsbGEiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IkBzdW1fYXNpYW46IGNsdXN0ZXJTdW0oJ2FzaWFuX3BvcCcpXG5Ac3VtX2JsYWNrOiBjbHVzdGVyU3VtKCdibGFja19wb3AnKVxuQHN1bV93aGl0ZTogY2x1c3RlclN1bSgnd2hpdGVfcG9wJylcbkBzdW1faGlzcGFuaWM6IGNsdXN0ZXJTdW0oJ2hpc3BhbmljX28nKVxuQHN1bV9hbGw6IEBzdW1fYXNpYW4gKyBAc3VtX2JsYWNrICsgQHN1bV9oaXNwYW5pYyArIEBzdW1fd2hpdGVcblxud2lkdGg6IHNxcnQoQHN1bV9hbGwpIC8gNDAwICogem9vbSgpXG5jb2xvcjogb3BhY2l0eShoc3YoMC4wMCwxLDEpICogQHN1bV9ibGFjayAvIEBzdW1fYWxsICogMSArXG4gICAgICAgICAgICAgICBoc3YoMC42NiwxLDEpICogQHN1bV9hc2lhbiAvIEBzdW1fYWxsICogMyArXG4gICAgICAgICAgICAgICBoc3YoMC4xNSwwLDEpICogQHN1bV93aGl0ZSAvIEBzdW1fYWxsICogMC44ICtcbiAgICAgICAgICAgICAgIGhzdigwLjMzLDEsMSkgKiBAc3VtX2hpc3BhbmljIC8gQHN1bV9hbGwgKiAxLCAwLjgpXG5zdHJva2VXaWR0aDogMVxuc3Ryb2tlQ29sb3I6ICMwMDBcbm9yZGVyOiBkZXNjKHdpZHRoKCkpXG5yZXNvbHV0aW9uOiA0IiwiZiI6eyJsbmciOi05My44OTcyNDIxNDkwNTEwNywibGF0IjozNS44NzUwNTAxNzI5MzYzfSwiZyI6My4xMDgwODI0NzkyMTU1OTA4LCJoIjoiRGFya01hdHRlciJ9');
    addButton('Pluto', 'eyJhIjoibW5tYXBwbHV0byIsImIiOiIiLCJjIjoiZG1hbnphbmFyZXMiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6ImNvbG9yOiByYW1wKGxpbmVhcihsb2coJG51bWZsb29ycyksIDEsIDQpLCBFYXJ0aClcbnN0cm9rZUNvbG9yOiBvcGFjaXR5KHdoaXRlLCAwLjIpIiwiZiI6eyJsbmciOi03My45OTAyNzc5MTQwMjQ3MiwibGF0Ijo0MC43MzU2MTIxMDYwNzE3M30sImciOjExLjg4MzM3NzcxNjEzNzEzMywiaCI6IkRhcmtNYXR0ZXIifQ==');
    addButton('Pluto - filtered', 'eyJhIjoibW5tYXBwbHV0byIsImIiOiIiLCJjIjoiZG1hbnphbmFyZXMiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6ImNvbG9yOiByYW1wKGxpbmVhcihsb2coJG51bWZsb29ycyksIDIsIDQpLCB0ZW1wcylcbnN0cm9rZUNvbG9yOiBvcGFjaXR5KHdoaXRlLCAwLjUpXG5maWx0ZXI6IGJldHdlZW4oJG51bWZsb29ycywgMTAsIDEyMCkiLCJmIjp7ImxuZyI6LTczLjk4MzUzMzQ0MzgwNjMyLCJsYXQiOjQwLjc0Nzk3Njc1MTMyN30sImciOjEyLjU2MjkzNjMwNTQ0ODY4MiwiaCI6IkRhcmtNYXR0ZXIifQ==');
    addButton('SF Lines', 'eyJhIjoic2Zfc3RjbGluZXMiLCJiIjoiIiwiYyI6ImRtYW56YW5hcmVzIiwiZCI6ImNhcnRvLmNvbSIsImUiOiJjb2xvcjogcmFtcCgkc3RfdHlwZSwgcHJpc20pIFxud2lkdGg6IDEuNSIsImYiOnsibG5nIjotMTIyLjQ0NDA4NDg2ODYxMTkyLCJsYXQiOjM3Ljc3MzcwNjczNjE0OTcwNX0sImciOjExLjY2NDMxMDgwMjg2NjgwNX0=');
    addButton('Gecat', 'eyJhIjoic2VsZWN0ICosIDEgYXMgY28gZnJvbSBnZWNhdF9nZW9kYXRhX2NvcHkiLCJiIjoiIiwiYyI6ImNkYnNvbC1hZG1pbiIsImQiOiJodHRwczovL3t1c2VyfS5jYXJ0by5jb20iLCJlIjoiY29sb3I6IG9wYWNpdHkocmFtcChsaW5lYXIobG9nKGNsdXN0ZXJBdmcoJ3NwZWVkJykpLCAwLCA0KSwgR2V5c2VyKSwgY2x1c3RlclN1bSgnY28nKSp6b29tKCkvMTAwMDAwKjEuOCo0KVxud2lkdGg6IDJcbnN0cm9rZVdpZHRoOiAwXG5yZXNvbHV0aW9uOiAwLjI1IiwiZiI6eyJsbmciOjIuMTI4NjA0MDYzNjA0ODI1NiwibGF0Ijo0MS4zODg4NDYxMTA0MDAwNH0sImciOjExLjM5MzcxOTA1NjQ0ODMxOSwiaCI6IkRhcmtNYXR0ZXIifQ==');
    addButton('BC Category filtering', 'eyJhIjoidHhfMDEyNV9jb3B5X2NvcHkiLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiBzcXJ0KGNsdXN0ZXJTdW0oJ2Ftb3VudCcpLzUwMDAwKSoyMCooem9vbSgpLzQwMDArMC4wMSkqMS41XG5jb2xvcjogcmFtcChjbHVzdGVyTW9kZSgnY2F0ZWdvcnknKSwgUHJpc20pXG5zdHJva2VDb2xvcjogb3BhY2l0eSh3aGl0ZSwgMC41KVxuZmlsdGVyOiBpbihjbHVzdGVyTW9kZSgnY2F0ZWdvcnknKSwgWydUcmFuc3BvcnRlcycsICdTYWx1ZCddKSIsImYiOnsibG5nIjoyLjE3ODE3MzAyMjg4OTA0MSwibGF0Ijo0MS4zOTkzMDU5MTQwNzkwNH0sImciOjExLjg4MjkxOTA0MjcxNzQzMiwiaCI6IkRhcmtNYXR0ZXIifQ==');

    if (location.hash.length > 1) {
        setConfig(location.hash.substring(1));
    } else {
        barcelona();
    }

    map.on('moveend', saveConfig);
});

function saveConfig() {
    location.hash = getConfig();
}

function getConfig() {
    return '#' + btoa(JSON.stringify({
        a: $('#dataset').val(),
        b: '',
        c: $('#user').val(),
        d: $('#serverURL').val(),
        e: $('#styleEntry').val(),
        f: map.getCenter(),
        g: map.getZoom(),
        h: basemap
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
    try {
        superRefresh({ zoom: c.g, center: c.f, basemap: c.h });
    } catch (error) {
        handleError(error);
        $('#loader').removeClass('spin');
    }
}

const superRefresh = (opts) => {
    opts = opts || {};
    $('#loader').addClass('spin');
    document.getElementById('feedback').style.display = 'none';
    const SourceClass = $('#dataset').val().toLowerCase().includes('select') ? carto.source.SQL : carto.source.Dataset;
    const source = new SourceClass(
        $('#dataset').val(),
        {
            user: $('#user').val(),
            apiKey: 'default_public'
        },
        {
            serverURL: $('#serverURL').val()
        }
    );
    const vizStr = document.getElementById('styleEntry').value;
    const viz = new carto.Viz(vizStr);
    if (!layer) {
        setupMap(opts);
        layer = new carto.Layer('myCartoLayer', source, viz);
        layer.on('loaded', () => {
            $('#loader').removeClass('spin');
        });
        layer.addTo(map, 'watername_ocean');
    } else {
        layer.update(source, viz).then(() => {
            setupMap(opts);
            $('#loader').removeClass('spin');
        }).catch(error => {
            handleError(error);
            $('#loader').removeClass('spin');
        });
    }
};

function setupMap(opts) {
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

function handleError(error) {
    const err = `Invalid viz: ${error}:${error.stack}`;
    console.warn(err);
    document.getElementById('feedback').value = err;
    document.getElementById('feedback').style.display = 'block';
}

function createBasemapElements() {
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

function setBasemap(id) {
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

document.getElementById('fullscreen').onclick = () => {
    document.getElementById('mapDiv').style.height = '100%';
    document.body.style.overflow = 'hidden';
    document.querySelector('.container').style.display = 'none';
    document.querySelector('.map-info').style.display = 'none';
    map.resize();
};
