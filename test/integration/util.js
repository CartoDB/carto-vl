import mapboxgl from 'mapbox-gl';
import { projectToWebMercator, WM_2R } from '../../src/utils/util';

const mapSize = 600;

export function createMap (name, size) {
    const div = createMapDivHolder(name, size);

    const map = new mapboxgl.Map({
        container: name,
        style: { version: 8, sources: {}, layers: [] },
        center: [0, 0],
        zoom: 0
    });

    return { div, map };
}

export function createMapDivHolder (name, size) {
    size = size || mapSize;

    const div = document.createElement('div');
    div.id = name;
    div.style.width = `${size}px`;
    div.style.height = `${size}px`;
    div.style.position = 'absolute';
    div.style.border = '1px red solid';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.appendChild(div);

    return div;
}

function _mouseParamsFromCoords (coordinates) {
    const position = project(coordinates);
    const params = { clientX: position.x, clientY: position.y, bubbles: true };
    return params;
}

export function simulateClick (coordinates) {
    const el = document.querySelector('.mapboxgl-canvas-container');
    if (!el) return;

    const params = _mouseParamsFromCoords(coordinates);
    const mousedown = new MouseEvent('mousedown', params);
    const click = new MouseEvent('click', params);
    const mouseup = new MouseEvent('mouseup', params);

    el.dispatchEvent(mousedown);
    el.dispatchEvent(click);
    el.dispatchEvent(mouseup);
}

export function simulateMove (coordinates) {
    const el = document.querySelector('.mapboxgl-canvas-container');
    if (!el) return;

    const params = _mouseParamsFromCoords(coordinates);
    const mousemove = new MouseEvent('mousemove', params);
    el.dispatchEvent(mousemove);
}

export function simulateDrag (coordinatesList) {
    const el = document.querySelector('.mapboxgl-canvas-container');
    if (!el) return;

    const first = coordinatesList[0];
    const last = coordinatesList[coordinatesList.length - 1];

    const mouseEvents = [];
    mouseEvents.push(new MouseEvent('mousedown', _mouseParamsFromCoords(first)));
    coordinatesList.forEach((coords) => {
        mouseEvents.push(new MouseEvent('mousemove', _mouseParamsFromCoords(coords)));
    });
    mouseEvents.push(new MouseEvent('mouseup', _mouseParamsFromCoords(last)));

    mouseEvents.forEach((event) => el.dispatchEvent(event));
}

function project (coordinates) {
    const wm = projectToWebMercator(coordinates);
    return {
        x: mapSize * (0.5 + wm.x / WM_2R),
        y: mapSize * (0.5 - wm.y / WM_2R)
    };
}
