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
        
        this._prevFeatures = [];
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
        const featureEvent = this._createFeatureEvent(event);
        const currentFeatures = featureEvent.features;

        // Manage enter/leave events
        const featuresLeft = this._getDiffFeatures(this._prevFeatures, currentFeatures);
        const featuresEntered = this._getDiffFeatures(currentFeatures, this._prevFeatures);
        
        if (featuresLeft.length > 0) {
            this._fireEvent('featureLeave', {
                coordinates: featureEvent.coordinates,
                position: featureEvent.position,
                features: featuresLeft
            });
        }
        
        if (featuresEntered.length > 0) {
            this._fireEvent('featureEnter', {
                coordinates: featureEvent.coordinates,
                position: featureEvent.position,
                features: featuresEntered
            });
        }

        this._prevFeatures = featureEvent.features;
        
        // Launch hover event
        this._fireEvent('featureHover', featureEvent);
    }

    _onClick(event) {
        const featureEvent = this._createFeatureEvent(event);
        const currentFeatures = featureEvent.features;
        
        // Manage clickOut event
        const featuresClickedOut = this._getDiffFeatures(this._prevFeatures, currentFeatures);
        
        if (featuresClickedOut.length > 0) {
            this._fireEvent('featureClickOut', {
                coordinates: featureEvent.coordinates,
                position: featureEvent.position,
                features: featuresClickedOut
            });
        }

        this._prevFeatures = featureEvent.features;

        // Launch click event
        this._fireEvent('featureClick', featureEvent);
    }

    _createFeatureEvent(eventData) {
        const features = this._getFeaturesAtPosition(eventData.lngLat);
        return {
            coordinates: eventData.lngLat,
            position: eventData.point,
            features
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
    
    /**
     * Return the difference between the feature arrays A and B.
     * The output value is also an array of features.
     */
    _getDiffFeatures(featuresA, featuresB) {
        let featuresDiff = [];
        const IDs = this._getFeatureIDs(featuresB);
        for (let feature of featuresA) {
            if (!IDs.includes(feature.id)) {
                featuresDiff.push(feature);
            }
        }
        return featuresDiff;
    }
    
    _getFeatureIDs(features) {
        return features.map(feature => feature.id);
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
