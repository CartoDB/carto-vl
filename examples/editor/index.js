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

    `width: sqrt(clusterSum($amount)/50000)*20*(zoom()/4000+0.01)*1.5
color: ramp(clusterMode($category), PRISM)
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
    dragRotate: false,
});
map.touchZoomRotate.disableRotation();

let layer = null;
setInterval(() => {
    if (layer) {
        document.getElementById('title').innerText = `~ ${layer.getNumFeatures()} features`;
    }
}, 500);

map.on('zoom', updateMapInfo);
map.on('move', updateMapInfo);

function updateMapInfo() {
    let center = map.getCenter();
    document.querySelector('.map-info').innerText = `center: [${center.lng.toFixed(6)}, ${center.lat.toFixed(6)}],zoom: ${map.getZoom().toFixed(6)}`;
}

map.on('load', () => {
    let index = 0; //vizs.length - 1;
    updateMapInfo();

    function updateViz(v) {
        v = v || document.getElementById('styleEntry').value;
        document.getElementById('styleEntry').value = v;
        saveConfig();
        try {
            if (layer) {
                $('#loader').addClass('spin');
                document.getElementById('feedback').style.display = 'none';
                layer.blendToViz(new carto.Viz(v)).then(() => {
                    $('#loader').removeClass('spin');
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

        $('#dataset').val('spend_data');
        $('#user').val('cartovl');
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
    addButton('WWI ships', 'eyJhIjoid3dpIiwiYiI6IiIsImMiOiJjYXJ0b2dsIiwiZCI6Imh0dHBzOi8ve3VzZXJ9LmNhcnRvLmNvbSIsImUiOiJ3aWR0aDogIHpvb20oKSAqICh0b3JxdWUoJGRheSwgMTQwLCBmYWRlKDAuMDUsIDAuMikpICsgMC41KVxuY29sb3I6ICByYW1wKGxpbmVhcihjbHVzdGVyQXZnKCR0ZW1wKSwgMCwzMCksIHRlYWxyb3NlKVxuc3Ryb2tlV2lkdGg6IDBcbmZpbHRlcjogdG9ycXVlKCRkYXksIDE0MCwgZmFkZSgwLjA1LCAwLjIpKSArIDAuMDUiLCJmIjp7ImxuZyI6MjQuNzM1NTY4NTIwNDAyOTIsImxhdCI6MTkuMTYzNDcwOTc4NzU0OTQ0fSwiZyI6MC44NDM4NjY0MzkyMzEyODQsImgiOiJEYXJrTWF0dGVyIn0=');
    addButton('Butterfly migrations', 'eyJhIjoibW9uYXJjaF9taWdyYXRpb25fMSIsImIiOiIiLCJjIjoibWFtYXRhYWtlbGxhIiwiZCI6Imh0dHBzOi8ve3VzZXJ9LmNhcnRvLmNvbSIsImUiOiJ3aWR0aDogc3FydCgkbnVtYmVyLzEwKVxuY29sb3I6IG9wYWNpdHkocmFtcChsaW5lYXIoY2x1c3Rlck1heCgkbnVtYmVyKV4wLjUsIDAsIDUwKSwgU3Vuc2V0KSwwLjcpXG5zdHJva2VDb2xvcjogcmFtcChsaW5lYXIoY2x1c3Rlck1heCgkbnVtYmVyKV4wLjUsMCwgNTApLCBTdW5zZXQpXG5zdHJva2VXaWR0aDogMVxuXG5cblxuXG5cbiIsImYiOnsibG5nIjotODcuNzA5OTUzMDUwNzA4MDEsImxhdCI6MzcuMzcwMDQ5NTk5ODkzNDM0fSwiZyI6Mi44Mzc3OTI1MDM2MzI1Njc1fQ==');
    addButton('Non-white', 'eyJhIjoidGFibGVfNXlyX2NvdW50eV9hY3NfY29weV8xIiwiYiI6IiIsImMiOiJtYW1hdGFha2VsbGEiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiAoJGFzaWFuX3BvcCskYmxhY2tfcG9wKyRoaXNwYW5pY19vKS8kd2hpdGVfcG9wXG5jb2xvcjogaHN2YSgwLjUsIDEsIDEsIDAuNylcbnN0cm9rZVdpZHRoOiAwIiwiZiI6eyJsbmciOi05MC42OTkwNTg1MTI0MTE5NywibGF0Ijo0MC42MjE0NzUyMzQ0MTY2NjR9LCJnIjoyLjQ1NzMzNjA2NDIyMzUzMSwiaCI6IkRhcmtNYXR0ZXIifQ==');
    addButton('Denver accidents',
        'eyJhIjoidHJhZmZpY19hY2NpZGVudHNfY29weSIsImIiOiIiLCJjIjoibWFtYXRhYWtlbGxhIiwiZCI6Imh0dHBzOi8ve3VzZXJ9LmNhcnRvLmNvbSIsImUiOiJ3aWR0aDogICAkY291bnQvMlxuY29sb3I6IG9wYWNpdHkoIHJhbXAobGluZWFyKCRjb3VudCwgMCwxMjApLCBSZWRPciksICRjb3VudC8yMClcbnN0cm9rZVdpZHRoOiAwXG5cblxuIiwiZiI6eyJsbmciOi0xMDQuOTY1MDU2MjE1NjY3NDYsImxhdCI6MzkuNzQ5NjE5Mzc4MjQ2MjJ9LCJnIjoxMS40MTg3MTg3NzA5MDQ0OTQsImgiOiJEYXJrTWF0dGVyIn0=');
    addButton('California Wildfires by acreage', 'eyJhIjoiZmlyZV9wZXJpbWV0ZXJzX2NvcHkiLCJiIjoiIiwiYyI6Im1hbWF0YWFrZWxsYSIsImQiOiJodHRwczovL3t1c2VyfS5jYXJ0by5jb20iLCJlIjoid2lkdGg6ICAgJGdpc19hY3Jlcy8xMDAwMFxuY29sb3I6IHJnYmEoMCwwLDAsMClcbnN0cm9rZUNvbG9yOiAgaHN2KDAuMSwgJGdpc19hY3Jlcy8yMDAwMDAsICRnaXNfYWNyZXMvNDAwMDAwKVxuc3Ryb2tlV2lkdGg6ICRnaXNfYWNyZXMvNTAwMDAiLCJmIjp7ImxuZyI6LTExNi4yMTM4NzgzNjYzMjYzNiwibGF0IjozOC4wNzI3ODMxODgzNjE5NH0sImciOjUuMTgxMTg5ODYxNjUyMTg2fQ==');
    addButton('California Wildfires size/opacity by acres burned colored by cause ',
        'eyJhIjoiZmlyZV9wZXJpbWV0ZXJzX2NvcHkiLCJiIjoiIiwiYyI6Im1hbWF0YWFrZWxsYSIsImQiOiJodHRwczovL3t1c2VyfS5jYXJ0by5jb20iLCJlIjoid2lkdGg6ICRnaXNfYWNyZXMvMTAwMDBcbmNvbG9yOiBvcGFjaXR5KHJhbXAobGluZWFyKCRjYXVzZSwgMSwxNCksIFByaXNtKSwkZ2lzX2FjcmVzLzEwMDAwMClcbnN0cm9rZVdpZHRoOiAwXG5cblxuXG5cbiIsImYiOnsibG5nIjotMTE5LjY3MzA3NjMzNzkwNDgzLCJsYXQiOjM3LjQ3ODE1Mjg2ODA2NzU1fSwiZyI6NC45NDY5MTE0NDI1NTk3MTMsImgiOiJEYXJrTWF0dGVyIn0=');
    addButton('Population Density - Filtering & Buckets', 'eyJhIjoicG9wX2RlbnNpdHlfcG9pbnRzIiwiYiI6IiIsImMiOiJtYW1hdGFha2VsbGEiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiB6b29tKClcbmNvbG9yOiByYW1wKGJ1Y2tldHMoJGRuLCBbODAsIDEwMCwgMTQwXSksIHByaXNtKVxuc3Ryb2tlV2lkdGg6IDBcbmZpbHRlcjogJGRuID4gNjBcblxuXG5cbiIsImYiOnsibG5nIjoyMy40NTMwMTgxOTIzNzI2MSwibGF0IjoxMS4yMzk5NTYwNjg2NDAxNTR9LCJnIjoxLjM1NTk2MDUzMDY0MTEzNzMsImgiOiJEYXJrTWF0dGVyIn0=');
    addButton('Commuters who travel outside home county for work', 'eyJhIjoiY29tbXV0ZXJfZmxvd19ieV9jb3VudHlfNSIsImIiOiIiLCJjIjoibWFtYXRhYWtlbGxhIiwiZCI6Imh0dHBzOi8ve3VzZXJ9LmNhcnRvLmNvbSIsImUiOiJ3aWR0aDogJHdvcmtlcnNfaW5fZmxvdy8yOTAzNDYxKjEwMCo0XG5jb2xvcjogb3BhY2l0eShyYW1wKGxpbmVhcigkd29ya2Vyc19pbl9mbG93LDAsMTAwMDAwKSAsYWdfR3JuWWwpLCAkcmVzaWRlbmNlX2ZpcHNfY29uY2F0LSR3b3JrX2ZpcHNfY29uY2F0KVxuc3Ryb2tlV2lkdGg6IDBcblxuXG5cblxuXG5cbiIsImYiOnsibG5nIjotOTUuOTk2NTM1NTQ2MTU3OTksImxhdCI6MzQuNDQzOTIzMjQ3ODc1MDM0fSwiZyI6Mi42Mzg1MjMzODQ5MTY0NzU4LCJoIjoiRGFya01hdHRlciJ9');
    addButton('Ethnic', 'eyJhIjoidGFibGVfNXlyX2NvdW50eV9hY3NfY29weV8xIiwiYiI6IiIsImMiOiJtYW1hdGFha2VsbGEiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IkBzdW1fYXNpYW46IGNsdXN0ZXJTdW0oJGFzaWFuX3BvcClcbkBzdW1fYmxhY2s6IGNsdXN0ZXJTdW0oJGJsYWNrX3BvcClcbkBzdW1fd2hpdGU6IGNsdXN0ZXJTdW0oJHdoaXRlX3BvcClcbkBzdW1faGlzcGFuaWM6IGNsdXN0ZXJTdW0oJGhpc3BhbmljX28pXG5Ac3VtX2FsbDogQHN1bV9hc2lhbiArIEBzdW1fYmxhY2sgKyBAc3VtX2hpc3BhbmljICsgQHN1bV93aGl0ZVxuXG53aWR0aDogc3FydChAc3VtX2FsbCkgLyA0MDAgKiB6b29tKClcbmNvbG9yOiBvcGFjaXR5KGhzdigwLjAwLDEsMSkgKiBAc3VtX2JsYWNrIC8gQHN1bV9hbGwgKiAxICtcbiAgICAgICAgICAgICAgIGhzdigwLjY2LDEsMSkgKiBAc3VtX2FzaWFuIC8gQHN1bV9hbGwgKiAzICtcbiAgICAgICAgICAgICAgIGhzdigwLjE1LDAsMSkgKiBAc3VtX3doaXRlIC8gQHN1bV9hbGwgKiAwLjggK1xuICAgICAgICAgICAgICAgaHN2KDAuMzMsMSwxKSAqIEBzdW1faGlzcGFuaWMgLyBAc3VtX2FsbCAqIDEsIDAuOClcbnN0cm9rZVdpZHRoOiAxXG5zdHJva2VDb2xvcjogIzAwMFxub3JkZXI6IGRlc2Mod2lkdGgoKSlcbnJlc29sdXRpb246IDQiLCJmIjp7ImxuZyI6LTkzLjg5NzI0MjE0OTA1MTA3LCJsYXQiOjM1Ljg3NTA1MDE3MjkzNjN9LCJnIjozLjEwODA4MjQ3OTIxNTU5MDh9');
    addButton('Pluto', 'eyJhIjoibW5tYXBwbHV0byIsImIiOiIiLCJjIjoiZG1hbnphbmFyZXMiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6ImNvbG9yOiByYW1wKGxpbmVhcihsb2coJG51bWZsb29ycyksIDEsIDQpLCBFYXJ0aClcbnN0cm9rZUNvbG9yOiBvcGFjaXR5KHdoaXRlLCAwLjIpIiwiZiI6eyJsbmciOi03My45OTAyNzc5MTQwMjQ3MiwibGF0Ijo0MC43MzU2MTIxMDYwNzE3M30sImciOjExLjg4MzM3NzcxNjEzNzEzMywiaCI6IkRhcmtNYXR0ZXIifQ==');
    addButton('Pluto - filtered', 'eyJhIjoibW5tYXBwbHV0byIsImIiOiIiLCJjIjoiZG1hbnphbmFyZXMiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6ImNvbG9yOiByYW1wKGxpbmVhcihsb2coJG51bWZsb29ycyksIDIsIDQpLCB0ZW1wcylcbnN0cm9rZUNvbG9yOiBvcGFjaXR5KHdoaXRlLCAwLjUpXG5maWx0ZXI6IGJldHdlZW4oJG51bWZsb29ycywgMTAsIDEyMCkiLCJmIjp7ImxuZyI6LTczLjk4MzUzMzQ0MzgwNjMyLCJsYXQiOjQwLjc0Nzk3Njc1MTMyN30sImciOjEyLjU2MjkzNjMwNTQ0ODY4MiwiaCI6IkRhcmtNYXR0ZXIifQ==');
    addButton('SF Lines', 'eyJhIjoic2Zfc3RjbGluZXMiLCJiIjoiIiwiYyI6ImRtYW56YW5hcmVzIiwiZCI6ImNhcnRvLmNvbSIsImUiOiJjb2xvcjogcmFtcCgkc3RfdHlwZSwgcHJpc20pIFxud2lkdGg6IDEuNSIsImYiOnsibG5nIjotMTIyLjQ0NDA4NDg2ODYxMTkyLCJsYXQiOjM3Ljc3MzcwNjczNjE0OTcwNX0sImciOjExLjY2NDMxMDgwMjg2NjgwNX0=');
    addButton('Gecat', 'eyJhIjoic2VsZWN0ICosIDEgYXMgY28gZnJvbSBnZWNhdF9nZW9kYXRhX2NvcHkiLCJiIjoiIiwiYyI6ImNkYnNvbC1hZG1pbiIsImQiOiJodHRwczovL3t1c2VyfS5jYXJ0by5jb20iLCJlIjoiY29sb3I6IG9wYWNpdHkocmFtcChsaW5lYXIobG9nKGNsdXN0ZXJBdmcoJHNwZWVkKSksIDAsIDQpLCBHZXlzZXIpLCBjbHVzdGVyU3VtKCRjbykqem9vbSgpLzEwMDAwMCoxLjgqNClcbndpZHRoOiAyXG5zdHJva2VXaWR0aDogMFxucmVzb2x1dGlvbjogMC4yNSIsImYiOnsibG5nIjoyLjEyODYwNDA2MzYwNDgyNTYsImxhdCI6NDEuMzg4ODQ2MTEwNDAwMDR9LCJnIjoxMS4zOTM3MTkwNTY0NDgzMTksImgiOiJEYXJrTWF0dGVyIn0=');
    addButton('BC Category filtering', 'eyJhIjoidHhfMDEyNV9jb3B5X2NvcHkiLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiBzcXJ0KGNsdXN0ZXJTdW0oJGFtb3VudCkvNTAwMDApKjIwKih6b29tKCkvNDAwMCswLjAxKSoxLjVcbmNvbG9yOiByYW1wKGNsdXN0ZXJNb2RlKCRjYXRlZ29yeSksIFByaXNtKVxuc3Ryb2tlQ29sb3I6IG9wYWNpdHkod2hpdGUsIDAuNSlcbmZpbHRlcjogaW4oY2x1c3Rlck1vZGUoJGNhdGVnb3J5KSwgW1wiVHJhbnNwb3J0ZXNcIiwgXCJTYWx1ZFwiXSkiLCJmIjp7ImxuZyI6Mi4xNzgxNzMwMjI4ODkwNDEsImxhdCI6NDEuMzk5MzA1OTE0MDc5MDR9LCJnIjoxMS44ODI5MTkwNDI3MTc0MzIsImgiOiJEYXJrTWF0dGVyIn0=');
    addButton('Crazy sprites', 'eyJhIjoidHJhZmZpY19hY2NpZGVudHNfY29weSIsImIiOiIiLCJjIjoibWFtYXRhYWtlbGxhIiwiZCI6Imh0dHBzOi8ve3VzZXJ9LmNhcnRvLmNvbSIsImUiOiJ3aWR0aDogICAkY291bnQvMiArOFxuY29sb3I6IG9wYWNpdHkoIHJhbXAobGluZWFyKCRjb3VudCwgMCwxMjApLCBSZWRPciksICRjb3VudC8yMCswLjQpXG5zeW1ib2xQbGFjZW1lbnQ6IHBsYWNlbWVudChzaW4oMC4xKiRjb3VudCpub3coKSkgLCBjb3MoMC4xKiRjb3VudCpub3coKSkpXG5zeW1ib2w6IHJhbXAoYnVja2V0cygxMDAqKDAuMSpub3coKSUxID4wLjUpLCAgWzUwXSksIHNwcml0ZXMoW1xuICAgIHNwcml0ZSgnLi4vZXhwcmVzc2lvbnMvbWFya2VyLnN2ZycpLFxuICAgIHNwcml0ZSgnLi4vZXhwcmVzc2lvbnMvbWFya2VyMi5zdmcnKVxuXSkpXG5cblxuICIsImYiOnsibG5nIjotMTA0Ljk5MjU5NzAzNjgxMDI1LCJsYXQiOjM5LjcyNzQyMzc3NjM5MjA3fSwiZyI6MTIuNzIzMTcwNDU3Njg4NDU3LCJoIjoiRGFya01hdHRlciJ9');

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
    return '#' + btoa(JSON.stringify(getJSONConfig()));
}

function getJSONConfig() {
    return {
        a: $('#dataset').val(),
        b: '',
        c: $('#user').val(),
        d: $('#serverURL').val(),
        e: $('#styleEntry').val(),
        f: map.getCenter(),
        g: map.getZoom(),
        h: basemap
    };
}

function setConfig(input) {
    let c = JSON.parse(atob(input));
    if (c.c == 'dmanzanares-ded13') {
        c.c = 'cartovl';
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

const $exportMapButton = document.getElementById('export-map-button');
const $copyHTMLButton = document.getElementById('copy-html-button');
const $mapTextarea = document.getElementById('map-textarea');

$exportMapButton.addEventListener('click', () => {
    const config = getJSONConfig();
    $mapTextarea.value = generateSnippet(config);
});

$copyHTMLButton.addEventListener('click', () => {
    $mapTextarea.select();
    document.execCommand('copy');
});


/**
 * Generates an HTML template for the given map configuration
 */
function generateSnippet(config) {
    const dataset = config.a;
    const apiKey = config.b || 'default_public';
    const username = config.c;
    const serverURL = config.d || 'https://{user}.carto.com';
    const vizSpec = config.e || '';
    const center = config.f || { lat: 0, lng: 0 };
    const zoom = config.g || 10;
    const basemap = BASEMAPS[config.h] || 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';


    return `<!DOCTYPE html>
        <html>
        <head>
        <title>Add layer | CARTO</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta charset="UTF-8">
        <!-- Include CARTO VL JS -->
        <script src="https://cartodb.github.io/carto-vl/dist/carto-vl.js"></script>
        <!-- Include Mapbox GL JS -->
        <script src="https://libs.cartocdn.com/mapbox-gl/v0.45.0-carto1/mapbox-gl.js"></script>
        <!-- Include Mapbox GL CSS -->
        <link href="https://libs.cartocdn.com/mapbox-gl/v0.45.0-carto1/mapbox-gl.css" rel="stylesheet" />
        <style>
           #map {
                position: absolute;
                width: 100vw;
                height: 100vh;
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
                zoom: ${zoom},
                dragRotate: false,
                touchZoomRotate: false
            });
        
            carto.setDefaultConfig({
                serverURL: '${serverURL}'
            });

            carto.setDefaultAuth({
                user: '${username}',
                apiKey: '${apiKey}'
            });

        
            const source = new carto.source.Dataset('${dataset}');
            const viz = new carto.Viz(\`${vizSpec}\`);
            const layer = new carto.Layer('layer', source, viz);
        
            layer.addTo(map, 'watername_ocean');
        </script>
        </body>
        </html>
    `;
}
