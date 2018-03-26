import mitt from 'mitt';
import Layer from './layer';
import { WM_R, projectToWebMercator } from './util';
import { wToR } from '../client/rsys';

const EVENTS = [
    'featureClick',
    'featureClickOut',
    'featureEnter',
    'featureHover',
    'featureLeave',
];
export default class Interactivity {
    constructor(layerList) {
        checkLayerList(layerList);
        this._init(layerList);
    }

    _init(layerList) {
        this._emitter = mitt();
        this._layerList = layerList;
        this._subscribeToIntegratorEvents(layerList[0].getIntegrator());
    }

    on(eventName, callback) {
        checkEvent(eventName);
        return this._emitter.on(eventName, callback);
    }

    off(eventName, callback) {
        checkEvent(eventName);
        return this._emitter.off(eventName, callback);
    }

    _subscribeToIntegratorEvents(integrator) {
        integrator.on('mousemove', this._onMouseMove.bind(this));
        integrator.on('click', this._onClick.bind(this));
    }

    _onMouseMove(event) {
        const data = this._createFeatureEvent(event);
        this._fireEvent('', data);
    }

    _onClick(event) {
        const data = this._createFeatureEvent(event);
        this._fireEvent('featureClick', data);
    }

    _createFeatureEvent(eventData) {
        const features = this._getFeaturesAtPosition(eventData.lngLat);
        return {
            features,
            coordinates: eventData.lngLat,
            position: eventData.point,
        };
    }

    _fireEvent(type, featureEvent) {
        this._emitter.emit(type, featureEvent);
    }

    _getFeaturesAtPosition(lngLat) {
        const wm = projectToWebMercator(lngLat);
        const nwmc = wToR(wm.x, wm.y, { scale: WM_R, center: { x: 0, y: 0 } });
        return [].concat(...this._layerList.map(layer => layer.getFeaturesAtPosition(nwmc)));
    }
}

function checkLayerList(layerList) {
    if (!Array.isArray(layerList)) {
        throw new Error('Invalid layer list, parameter must be an array of carto.Layer objects');
    }
    if (!layerList.length) {
        throw new Error('Invalid argument, layer list must not be empty');
    }
    if (!layerList.every(layer => layer instanceof Layer)) {
        throw new Error('Invalid layer, layer must be an instance of carto.Layer');
    }
    if (layerList.some(layer => !layer.getIntegrator())) {
        throw new Error('Invalid argument, all layers must belong to some map');
    }
    if (!layerList.every(layer => layer.getIntegrator() == layerList[0].getIntegrator())) {
        throw new Error('Invalid argument, all layers must belong to the same map');
    }
}

function checkEvent(eventName) {
    if (!EVENTS.includes(eventName)) {
        throw new Error(`Unrecognized event: ${eventName}. Availiable events: ${EVENTS.join(', ')}`);
    }
}
