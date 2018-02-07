/*eslint-env jquery*/
/*eslint no-console: ["off"] */

import * as MGL from '../lib/api/mapboxgl';
import WindshaftSQL from '../lib/api/windshaft-sql';
import * as R from '../src/index';

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

var mapboxgl = window.mapboxgl;
mapboxgl.accessToken = 'pk.eyJ1IjoiZG1hbnphbmFyZXMiLCJhIjoiY2o5cHRhOGg5NWdzbTJxcXltb2g2dmE5NyJ9.RVto4DnlLzQc26j9H0g9_A';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', // stylesheet location
    center: [2.17, 41.38], // starting position [lng, lat]
    zoom: 13, // starting zoom,
});
var mgl = new MGL.MGLIntegrator(map, WindshaftSQL);


map.on('load', () => {
    let index = 0;//styles.length - 1;

    function updateStyle(v) {
        v = v || document.getElementById('styleEntry').value;
        document.getElementById('styleEntry').value = v;
        location.hash = getConfig();
        try {
            const s = R.Style.parseStyle(v);
            mgl.provider.setStyle(s, 1000);
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
        $('#apikey').val('8a174c451215cb8dca90264de342614087c4ef0c');
        $('#user').val('dmanzanares-ded13');
        $('#cartoURL').val('carto-staging.com');

        document.getElementById('styleEntry').value = styles[index];
        superRefresh();
    }
    function wwi() {
        $('.step').css('display', 'none');
        $('#styleEntry').removeClass('eight columns').addClass('twelve columns');
        $('#tutorial').text('');

        $('#dataset').val('wwi');
        $('#apikey').val('8a174c451215cb8dca90264de342614087c4ef0c');
        $('#user').val('dmanzanares-ded13');
        $('#cartoURL').val('carto-staging.com');

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
            b: $('#apikey').val(),
            c: $('#user').val(),
            d: $('#cartoURL').val(),
            e: $('#styleEntry').val(),
            f: map.getCenter(),
            g: map.getZoom(),
        }));
    }
    function setConfig(input) {
        const c = JSON.parse(atob(input));
        $('#dataset').val(c.a);
        $('#apikey').val(c.b);
        $('#user').val(c.c);
        $('#cartoURL').val(c.d);
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

        mgl.provider.setCartoURL($('#cartoURL').val());
        mgl.provider.setUser($('#user').val());
        mgl.provider.setApiKey($('#apikey').val());

        localStorage.setItem('cartoURL', $('#cartoURL').val());
        localStorage.setItem('user', $('#user').val());
        localStorage.setItem('apikey', $('#apikey').val());
        localStorage.setItem('dataset', $('#dataset').val());
        mgl.provider.setQueries($('#dataset').val());
        updateStyle();
    };


    $('#dataset').on('input', superRefresh);
    $('#apikey').on('input', superRefresh);
    $('#user').on('input', superRefresh);
    $('#cartoURL').on('input', superRefresh);

    $('#map').click((ev) => {
        let closerID = -1;
        let closerTile = null;
        let minD = 100000000;
        let cx = ev.offsetX / map.getCanvas().style.width.replace(/\D/g, '') * 2. - 1;
        let cy = -(ev.offsetY / map.getCanvas().style.height.replace(/\D/g, '') * 2. - 1);
        mgl.renderer.getStyledTiles().map(tile => {
            for (let i = 0; i < tile.size; i++) {
                const x = tile.geom[2 * i + 0] * tile.vertexScale[0] - tile.vertexOffset[0];
                const y = tile.geom[2 * i + 1] * tile.vertexScale[1] - tile.vertexOffset[1];
                const d = (x - cx) * (x - cx) + (y - cy) * (y - cy);
                if (d < minD) {
                    minD = d;
                    closerID = i;
                    closerTile = tile;
                }
            }
        });

        document.getElementById('popup').style.display = 'inline';
        const p = [
            closerTile.geom[2 * closerID + 0] * closerTile.vertexScale[0] - closerTile.vertexOffset[0],
            closerTile.geom[2 * closerID + 1] * closerTile.vertexScale[1] - closerTile.vertexOffset[1]
        ];
        document.getElementById('popup').style.top = (-p[1] * 0.5 + 0.5) * map.getCanvas().style.height.replace(/\D/g, '') + 'px';
        document.getElementById('popup').style.left = (p[0] * 0.5 + 0.5) * map.getCanvas().style.width.replace(/\D/g, '') + 'px';
        let str = '';
        Object.keys(closerTile.properties).map(name => {
            str += `${name}: ${closerTile.properties[name][closerID]}\n`;
        });
        $('#popup').text(str);
        console.log(closerID, minD, JSON.stringify(
            Object.keys(closerTile.properties).map(name => {
                return {
                    name: name,
                    property: closerTile.properties[name][closerID],
                    position: [
                        closerTile.geom[2 * closerID + 0] * closerTile.vertexScale[0] - closerTile.vertexOffset[0],
                        closerTile.geom[2 * closerID + 1] * closerTile.vertexScale[1] - closerTile.vertexOffset[1]
                    ]
                };
            }
            )
            , null, 4));
    });


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
    addButton('WWI ships', 'eyJhIjoid3dpIiwiYiI6IjhhMTc0YzQ1MTIxNWNiOGRjYTkwMjY0ZGUzNDI2MTQwODdjNGVmMGMiLCJjIjoiZG1hbnphbmFyZXMtZGVkMTMiLCJkIjoiY2FydG8tc3RhZ2luZy5jb20iLCJlIjoid2lkdGg6ICAgIGJsZW5kKDEsMixuZWFyKCRkYXksICgyNSpub3coKSkgJTEwMDAsIDAsIDEwKSwgY3ViaWMpICp6b29tKClcbmNvbG9yOiAgICBzZXRvcGFjaXR5KHJhbXAobGluZWFyKEFWRygkdGVtcCksIDAsMzApLCB0ZWFscm9zZSksIGJsZW5kKDAuMDA1LDEsbmVhcigkZGF5LCAoMjUqbm93KCkpICUxMDAwLCAwLCAxMCksIGN1YmljKSkiLCJmIjp7ImxuZyI6NjAuNDEzNjExNjc1MzE3NzI1LCJsYXQiOjIzLjIyMTc0Mzg0NDc0NjI4NX0sImciOjEuNTUxOTU5Nzc5MDI5NDE0Nn0=');
    addButton('Butterfly migrations', 'eyJhIjoibW9uYXJjaF9taWdyYXRpb25fMSIsImIiOiI0ZDIxMjM3NTM4NmJhZjFhMDliYjgyNjA4YzY0ODIxODhkYTNhNWIwIiwiYyI6Im1hbWF0YWFrZWxsYSIsImQiOiJjYXJ0by5jb20iLCJlIjoid2lkdGg6IHNxcnQoJG51bWJlci8xMClcbmNvbG9yOiBzZXRPcGFjaXR5KHJhbXAoTUFYKCRudW1iZXIpXjAuNSwgU3Vuc2V0LCAwLCA1MCksMC43KVxuc3Ryb2tlQ29sb3I6IHJhbXAoTUFYKCRudW1iZXIpXjAuNSwgU3Vuc2V0LCAwLCA1MClcbnN0cm9rZVdpZHRoOiAxXG5cblxuXG5cblxuIiwiZiI6eyJsbmciOi04Ny41MjA2MzAxNzY0MDM5OCwibGF0IjozNy4zNzc2OTk3NjY1MzkzMX0sImciOjIuNzQ2NTk0NjE1NjY2MTg5fQ==');
    addButton('Non-white', 'eyJhIjoidGFibGVfNXlyX2NvdW50eV9hY3NfY29weV8xIiwiYiI6IjRkMjEyMzc1Mzg2YmFmMWEwOWJiODI2MDhjNjQ4MjE4OGRhM2E1YjAiLCJjIjoibWFtYXRhYWtlbGxhIiwiZCI6ImNhcnRvLmNvbSIsImUiOiJ3aWR0aDogKCRhc2lhbl9wb3ArJGJsYWNrX3BvcCskaGlzcGFuaWNfbykvJHdoaXRlX3BvcFxuY29sb3I6IHNldE9wYWNpdHkoaHN2KDAuNSwxLDEpLDAuNykiLCJmIjp7ImxuZyI6LTkwLjY5OTA1ODUxMjQxMTk3LCJsYXQiOjQwLjYyMTQ3NTIzNDQxNjY2NH0sImciOjIuNDU3MzM2MDY0MjIzNTMxfQ==');
    addButton('Denver accidents',
        'eyJhIjoidHJhZmZpY19hY2NpZGVudHNfY29weSIsImIiOiI0ZDIxMjM3NTM4NmJhZjFhMDliYjgyNjA4YzY0ODIxODhkYTNhNWIwIiwiYyI6Im1hbWF0YWFrZWxsYSIsImQiOiJjYXJ0by5jb20iLCJlIjoid2lkdGg6ICAgJGNvdW50LzJcbmNvbG9yOiBzZXRPcGFjaXR5KHJhbXAoJGNvdW50LCBSZWRPciwwLDEyMCksKCRjb3VudC8yKS8xMClcblxuXG4iLCJmIjp7ImxuZyI6LTEwNC45NjUwNTYyMTU2Njc0NiwibGF0IjozOS43NDk2MTkzNzgyNDYyMn0sImciOjExLjQxODcxODc3MDkwNDQ5NH0=');
    addButton('California Wildfires by acreage', 'eyJhIjoiZmlyZV9wZXJpbWV0ZXJzX2NvcHkiLCJiIjoiNGQyMTIzNzUzODZiYWYxYTA5YmI4MjYwOGM2NDgyMTg4ZGEzYTViMCIsImMiOiJtYW1hdGFha2VsbGEiLCJkIjoiY2FydG8uY29tIiwiZSI6IndpZHRoOiAgICRnaXNfYWNyZXMvMTAwMDBcbmNvbG9yOiByZ2JhKDI1NSwyNTUsMjU1LDApXG5zdHJva2VDb2xvcjogIGhzdigwLjEsICRnaXNfYWNyZXMvMjAwMDAwLCAkZ2lzX2FjcmVzLzQwMDAwMClcbnN0cm9rZVdpZHRoOiAkZ2lzX2FjcmVzLzUwMDAwXG5cblxuXG4iLCJmIjp7ImxuZyI6LTExNi4yMTM4NzgzNjYzMjYzNiwibGF0IjozOC4wNzI3ODMxODgzNjE5NH0sImciOjUuMTgxMTg5ODYxNjUyMTg2fQ==');
    addButton('California Wildfires size/opacity by acres burned colored by cause ',
        'eyJhIjoiZmlyZV9wZXJpbWV0ZXJzX2NvcHkiLCJiIjoiNGQyMTIzNzUzODZiYWYxYTA5YmI4MjYwOGM2NDgyMTg4ZGEzYTViMCIsImMiOiJtYW1hdGFha2VsbGEiLCJkIjoiY2FydG8uY29tIiwiZSI6IndpZHRoOiAkZ2lzX2FjcmVzLzEwMDAwXG5jb2xvcjogc2V0T3BhY2l0eShyYW1wKCRjYXVzZSxQcmlzbSwxLDE0KSwkZ2lzX2FjcmVzLzEwMDAwMClcblxuXG5cblxuIiwiZiI6eyJsbmciOi0xMTUuNjI3MzM0MDY1MjkzMSwibGF0Ijo0MS4yMDU5MDgwMjA2MzQzNTR9LCJnIjozLjkyMzIzMjk2NDMzNzM1NzZ9');
    addButton('Population Density - Filtering & Buckets', 'eyJhIjoicG9wX2RlbnNpdHlfcG9pbnRzIiwiYiI6IjRkMjEyMzc1Mzg2YmFmMWEwOWJiODI2MDhjNjQ4MjE4OGRhM2E1YjAiLCJjIjoibWFtYXRhYWtlbGxhIiwiZCI6ImNhcnRvLmNvbSIsImUiOiJ3aWR0aDogem9vbSgpXG5jb2xvcjogcmFtcChidWNrZXRzKCRkbiwgODAsIDEwMCwgMTQwKSwgcHJpc20pKmdyZWF0ZXJUaGFuKCRkbiwgNjApXG5cblxuXG4iLCJmIjp7ImxuZyI6LTEwLjg0MDcyMTQwMTQ1MzI2NiwibGF0Ijo0MC4wNjQwNTQxNTY1NzA5Nn0sImciOjEuNDkxNzAxNzE4NTk3NTMyNX0=');
    addButton('Commuters who travel outside home county for work', 'eyJhIjoiY29tbXV0ZXJfZmxvd19ieV9jb3VudHlfNSIsImIiOiI0ZDIxMjM3NTM4NmJhZjFhMDliYjgyNjA4YzY0ODIxODhkYTNhNWIwIiwiYyI6Im1hbWF0YWFrZWxsYSIsImQiOiJjYXJ0by5jb20iLCJlIjoid2lkdGg6ICgkd29ya2Vyc19pbl9mbG93LzI5MDM0NjEqMTAwKSo0XG5jb2xvcjogc2V0T3BhY2l0eShyYW1wKCR3b3JrZXJzX2luX2Zsb3csYWdfR3JuWWwsMCwxMDAwMDApLCgkcmVzaWRlbmNlX2ZpcHNfY29uY2F0LSR3b3JrX2ZpcHNfY29uY2F0KSlcblxuXG5cblxuXG5cbiIsImYiOnsibG5nIjotOTUuOTk2NTM1NTQ2MTU3OTksImxhdCI6MzQuNDQzOTIzMjQ3ODc1MDM0fSwiZyI6Mi42Mzg1MjMzODQ5MTY0NzU4fQ==');
    addButton('Ethnic', 'eyJhIjoidGFibGVfNXlyX2NvdW50eV9hY3NfY29weV8xIiwiYiI6IjRkMjEyMzc1Mzg2YmFmMWEwOWJiODI2MDhjNjQ4MjE4OGRhM2E1YjAiLCJjIjoibWFtYXRhYWtlbGxhIiwiZCI6ImNhcnRvLmNvbSIsImUiOiJ3aWR0aDogc3FydChzdW0oJGFzaWFuX3BvcCkrc3VtKCRibGFja19wb3ApK3N1bSgkaGlzcGFuaWNfbykrc3VtKCR3aGl0ZV9wb3ApKS80MDAqem9vbSgpXG5jb2xvcjogc2V0b3BhY2l0eShoc3YoMC4sMSwxKSpzdW0oJGJsYWNrX3BvcCkvKHN1bSgkYXNpYW5fcG9wKStzdW0oJGJsYWNrX3BvcCkrc3VtKCRoaXNwYW5pY19vKStzdW0oJHdoaXRlX3BvcCkpKjErXG4gICAgICAgICAgICBoc3YoMC42NiwxLDEpKnN1bSgkYXNpYW5fcG9wKS8oc3VtKCRhc2lhbl9wb3ApK3N1bSgkYmxhY2tfcG9wKStzdW0oJGhpc3BhbmljX28pK3N1bSgkd2hpdGVfcG9wKSkqMytcbiAgICAgICAgICAgIGhzdigwLjMzLDEsMSkqc3VtKCRoaXNwYW5pY19vKS8oc3VtKCRhc2lhbl9wb3ApK3N1bSgkYmxhY2tfcG9wKStzdW0oJGhpc3BhbmljX28pK3N1bSgkd2hpdGVfcG9wKSkqMStcbiAgICAgICAgICAgIGhzdigwLjE1LDAsMSkqc3VtKCR3aGl0ZV9wb3ApLyhzdW0oJGFzaWFuX3BvcCkrc3VtKCRibGFja19wb3ApK3N1bSgkaGlzcGFuaWNfbykrc3VtKCR3aGl0ZV9wb3ApKSowLjgsIDAuOClcbnN0cm9rZUNvbG9yOiByZ2JhKDAsMCwwLDEuKVxuc3Ryb2tlV2lkdGg6IDFcbnJlc29sdXRpb246IDQiLCJmIjp7ImxuZyI6LTk3LjU2MzI1NTI1NTczNjY5LCJsYXQiOjQxLjAxNzcxOTYxMzEwMjI5fSwiZyI6NC4wNDY4MDg4MDEzODk5ODg2fQ==');
    addButton('Pluto', 'eyJhIjoibW5tYXBwbHV0byIsImIiOiJkOWQ2ODZkZjY1ODQyYThmZGRiZDE4NjcxMTI1NWNlNWQxOWFhOWI4IiwiYyI6ImRtYW56YW5hcmVzIiwiZCI6ImNhcnRvLmNvbSIsImUiOiJjb2xvcjogcmFtcChsaW5lYXIobG9nKCRudW1mbG9vcnMpLCAxLCA0KSwgRWFydGgpXG4iLCJmIjp7ImxuZyI6LTczLjkwNDM5MDkwNTU1NTQzLCJsYXQiOjQwLjc0OTExODc3NjQyMTR9LCJnIjoxMS43NDgzMTYzMjg5MTA2MjJ9');
    addButton('SF Lines', 'eyJhIjoic2Zfc3RjbGluZXMiLCJiIjoiZDlkNjg2ZGY2NTg0MmE4ZmRkYmQxODY3MTEyNTVjZTVkMTlhYTliOCIsImMiOiJkbWFuemFuYXJlcyIsImQiOiJjYXJ0by5jb20iLCJlIjoiY29sb3I6IHJhbXAoJHN0X3R5cGUsIHByaXNtKSBcbndpZHRoOiAxLjUiLCJmIjp7ImxuZyI6LTEyMi40NDQwODQ4Njg2MTE5MiwibGF0IjozNy43NzM3MDY3MzYxNDk3MDV9LCJnIjoxMS42NjQzMTA4MDI4NjY4MDV9');
    addButton('Gecat', 'eyJhIjoiKHNlbGVjdCAqLCAxIGFzIGNvIGZyb20gZ2VjYXRfZ2VvZGF0YV9jb3B5KSBBUyB0bXAiLCJiIjoiNzNmYWNmMmFiNmMyZTdlOTI5ZGFhODFhMjE5YTFmZDQ2NzRmMzBmNiIsImMiOiJjZGJzb2wtYWRtaW4iLCJkIjoiY2FydG8uY29tIiwiZSI6ImNvbG9yOiBzZXRvcGFjaXR5KHJhbXAobG9nKGF2Zygkc3BlZWQpKSwgR2V5c2VyLCAwLCA0KSwgIHN1bSgkY28pKnpvb20oKS8xMDAwMDAqMS44KjQpXG53aWR0aDogMlxucmVzb2x1dGlvbjogMC4yNSAiLCJmIjp7ImxuZyI6MS4yNjE2NzkyNjY5NTQ4NDMxLCJsYXQiOjQxLjcwNDEwNDk3NDkyMDQ1NX0sImciOjcuMzQ2NTM5NDk3NjAzMDR9');
    addButton('BC Category filtering', 'eyJhIjoidHhfMDEyNV9jb3B5X2NvcHkiLCJiIjoiOGExNzRjNDUxMjE1Y2I4ZGNhOTAyNjRkZTM0MjYxNDA4N2M0ZWYwYyIsImMiOiJkbWFuemFuYXJlcy1kZWQxMyIsImQiOiJjYXJ0by1zdGFnaW5nLmNvbSIsImUiOiJ3aWR0aDogc3FydChTVU0oJGFtb3VudCkvNTAwMDApKjIwKih6b29tKCkvNDAwMCswLjAxKSoxLjUqXG4oZXF1YWxzKE1PREUoJGNhdGVnb3J5KSwgXCJUcmFuc3BvcnRlc1wiKSArIGVxdWFscyhNT0RFKCRjYXRlZ29yeSksIFwiU2FsdWRcIikgKVxuY29sb3I6IHJhbXAoTU9ERSgkY2F0ZWdvcnkpLCBQcmlzbSkiLCJmIjp7ImxuZyI6Mi4xNjU4NTg4OTcwMDI3NDk1LCJsYXQiOjQxLjM3MDU1MjA4MDk0Mzg3fSwiZyI6MTEuNjg4MjUzMTg3MjM4MTk4fQ==');

    if (localStorage.getItem('dataset')) {
        $('#dataset').val(localStorage.getItem('dataset'));
        $('#apikey').val(localStorage.getItem('apikey'));
        $('#user').val(localStorage.getItem('user'));
        $('#cartoURL').val(localStorage.getItem('cartoURL'));
    }
    if (location.hash.length > 1) {
        setConfig(location.hash.substring(1));
    } else {
        barcelona();
    }
});
