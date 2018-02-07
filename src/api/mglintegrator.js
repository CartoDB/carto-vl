import * as R from '../core/renderer';

const DEG2RAD = Math.PI / 180;
const EARTH_RADIUS = 6378137;
const WM_R = EARTH_RADIUS * Math.PI; // Webmercator *radius*: half length Earth's circumference
const WM_2R = WM_R * 2; // Webmercator coordinate range (Earth's circumference)

let uid = 0;

// TODO This needs to be separated by each mgl map to support multi map pages
let integrator = null;
export default function getMGLIntegrator(map) {
    if (integrator) {
        return integrator;
    }
    return integrator ? integrator : new MGLIntegrator(map);
}

/**
 * Responsabilities, keep all MGL integration state and functionality that lies outside Layer
 */
class MGLIntegrator {
    constructor(map) {
        this.renderer = new R.Renderer();
        this.map = map;
        this.invalidateMGLWebGLState = null;

        map.on('resize', this.resize.bind(this));
        map.on('movestart', this.move.bind(this));
        map.on('move', this.move.bind(this));
        map.on('moveend', this.move.bind(this));

        this.moveObservers = {};

        this._layers = [];
    }
    _registerMoveObserver(observerName, observerCallback) {
        this.moveObservers[observerName] = observerCallback;
    }
    _unregisterMoveObserver(observerName) {
        delete this.moveObservers[observerName];
    }
    addLayer(layerId, beforeLayerID, moveCallback, paintCallback) {
        const callbackID = `_cartoGL_${uid++}`;
        this._registerMoveObserver(callbackID, moveCallback);
        this.map.repaint = true;
        this.map.addLayer({
            id: layerId,
            type: 'webgl',
            layout: {
                callback: callbackID,
            }
        }, beforeLayerID);
        this._layers.push(layerId);

        window[callbackID] = (gl, invalidate) => {
            if (!this.invalidateMGLWebGLState) {
                this.invalidateMGLWebGLState = invalidate;
                this.notifyObservers();
                this.renderer._initGL(gl);
            }
            paintCallback();
            invalidate();
        };

    }
    needRefresh() {
        this.map.repaint = true;
    }
    move() {
        var c = this.map.getCenter();
        // TODO create getCenter method
        this.renderer.setCenter(c.lng / 180., Wmxy(c).y / WM_R);
        this.renderer.setZoom(this.getZoom());
        this.notifyObservers();
    }
    resize() {
        this.canvas.style.width = this.map.getCanvas().style.width;
        this.canvas.style.height = this.map.getCanvas().style.height;
        this.move();
    }
    notifyObservers() {
        Object.keys(this.moveObservers).map(id => this.moveObservers[id]());
    }
    getZoom() {
        var b = this.map.getBounds();
        var c = this.map.getCenter();
        var nw = b.getNorthWest();
        var sw = b.getSouthWest();
        var z = (Wmxy(nw).y - Wmxy(sw).y) / WM_2R;
        this.renderer.setCenter(c.lng / 180., Wmxy(c).y / WM_R);
        return z;
    }
}

// Webmercator projection
function Wmxy(latLng) {
    let lat = latLng.lat * DEG2RAD;
    let lng = latLng.lng * DEG2RAD;
    let x = lng * EARTH_RADIUS;
    let y = Math.log(Math.tan(lat / 2 + Math.PI / 4)) * EARTH_RADIUS;
    return { x: x, y: y };
}
