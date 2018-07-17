import mapboxgl from '@carto/mapbox-gl';
import { projectToWebMercator, WM_2R } from '../../src/utils/util';

const mapSize = 600;

export function createMap (name) {
    const div = document.createElement('div');
    div.id = name;
    div.style.width = `${mapSize}px`;
    div.style.height = `${mapSize}px`;
    div.style.position = 'absolute';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.appendChild(div);

    const map = new mapboxgl.Map({
        container: name,
        style: { version: 8, sources: {}, layers: [] },
        center: [0, 0],
        zoom: 0
    });

    return { div, map };
}

export function simulateClick (coordinates) {
    const el = document.querySelector('.mapboxgl-canvas-container');
    const position = project(coordinates);
    const params = { clientX: position.x, clientY: position.y };

    const mousedown = new MouseEvent('mousedown', params);
    const click = new MouseEvent('click', params);
    const mouseup = new MouseEvent('mouseup', params);

    if (el) {
        el.dispatchEvent(mousedown);
        el.dispatchEvent(click);
        el.dispatchEvent(mouseup);
    }
}

export function simulateMove (coordinates) {
    const el = document.querySelector('.mapboxgl-canvas-container');
    const position = project(coordinates);
    const params = { clientX: position.x, clientY: position.y };

    const mousemove = new MouseEvent('mousemove', params);

    if (el) {
        el.dispatchEvent(mousemove);
    }
}

function project (coordinates) {
    const wm = projectToWebMercator(coordinates);
    return {
        x: mapSize * (0.5 + wm.x / WM_2R),
        y: mapSize * (0.5 - wm.y / WM_2R + 0.03 /* offset */)
    };
}
