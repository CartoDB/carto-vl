import mitt from 'mitt';
import * as R from '../../core/renderer';
import * as util from '../util';

let uid = 0;

// TODO This needs to be separated by each mgl map to support multi map pages
const integrators = new WeakMap();
export default function getMGLIntegrator(map) {
    if (!integrators.get(map)) {
        integrators.set(map, new MGLIntegrator(map));
    }
    return integrators.get(map);
}


/**
 * Responsabilities, keep all MGL integration state and functionality that lies outside Layer
 */
class MGLIntegrator {
    constructor(map) {
        this.renderer = new R.Renderer();
        this.map = map;
        this.invalidateWebGLState = null;
        this._emitter = mitt();


        this._suscribeToMapEvents(map);
        this.moveObservers = {};
        this._layers = [];
        this._paintedLayers = 0;
    }

    on(name, cb) {
        return this._emitter.on(name, cb);
    }

    off(name, cb) {
        return this._emitter.off(name, cb);
    }

    _suscribeToMapEvents(map) {
        map.on('movestart', this.move.bind(this));
        map.on('move', this.move.bind(this));
        map.on('moveend', this.move.bind(this));
        map.on('resize', this.move.bind(this));

        map.on('mousemove', data => {
            this._emitter.emit('mousemove', data);
        });
        map.on('click', data => {
            this._emitter.emit('click', data);
        });
    }

    _registerMoveObserver(observerName, observerCallback) {
        this.moveObservers[observerName] = observerCallback;
    }

    _unregisterMoveObserver(observerName) {
        delete this.moveObservers[observerName];
    }

    addLayer(layer, beforeLayerID) {
        const callbackID = `_cartoGL_${uid++}`;
        const layerId = layer.getId();
        this._registerMoveObserver(callbackID, layer.requestData.bind(layer));
        this.map.setCustomWebGLDrawCallback(layerId, (gl, invalidate) => {
            if (!this.invalidateWebGLState) {
                this.invalidateWebGLState = invalidate;
                this.notifyObservers();
                this.renderer._initGL(gl);
                this._layers.forEach(layer => layer.setRenderer(this.renderer));
            }
            layer.$paintCallback();
            this._paintedLayers++;

            if (this._paintedLayers % this._layers.length == 0) {
                // Last layer has been painted
                const isAnimated = this._layers.some(layer =>
                    layer.getViz() && layer.getViz().isAnimated());
                // Checking this.map.repaint is needed, because MGL repaint is a setter and it has the strange quite buggy side-effect of doing a "final" repaint after being disabled
                // if we disable it every frame, MGL will do a "final" repaint every frame, which will not disabled it in practice
                if (!isAnimated && this.map.repaint) {
                    this.map.repaint = false;
                }
            }

            invalidate();
        });
        this.map.addLayer({
            id: layerId,
            type: 'custom-webgl'
        }, beforeLayerID);
        this._layers.push(layer);
        this.move();
    }

    needRefresh() {
        this.map.repaint = true;
    }

    move() {
        var c = this.map.getCenter();
        // TODO create getCenter method
        this.renderer.setCenter(c.lng / 180., util.projectToWebMercator(c).y / util.WM_R);
        this.renderer.setZoom(this.getZoom());
        this.notifyObservers();
    }

    notifyObservers() {
        Object.keys(this.moveObservers).map(id => this.moveObservers[id]());
    }

    getZoom() {
        var b = this.map.getBounds();
        var c = this.map.getCenter();
        var nw = b.getNorthWest();
        var sw = b.getSouthWest();
        var z = (util.projectToWebMercator(nw).y - util.projectToWebMercator(sw).y) / util.WM_2R;
        this.renderer.setCenter(c.lng / 180., util.projectToWebMercator(c).y / util.WM_R);
        return z;
    }
}
