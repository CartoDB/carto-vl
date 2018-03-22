import mitt from 'mitt';
import Layer from './layer';

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
        this._emitter = mitt();
        this._layerList = layerList;

        this._subscribeToIntegratorEvents(this._layerList[0].getIntegrator());
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
