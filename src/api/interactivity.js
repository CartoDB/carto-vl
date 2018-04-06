import mitt from 'mitt';
import Layer from './layer';
import { WM_R, projectToWebMercator } from './util';
import { wToR } from '../client/rsys';


/**
 *
 * FeatureEvent objects are fired by {@link carto.Interactivity|Interactivity} objects.
 * @typedef {Object} FeatureEvent
 * @property {object} coordinates LongLat coordinates in {lng: 0, lat:0} form
 * @property {object} position pixel coordinates in {x: 0, y: 0} form
 * @property {Array<carto.Feature>} features array of {@link carto.Feature}
 * @api
 */

/**
 *
 * Feature objects are provided by {@link carto.FeatureEvent} events.
 * @typedef {Object} Feature
 * @property {Number} id cartodb_id
 * @property {Object} properties Object with the feature properties in {propertyName1: 12.4, propertyName2: 'red'} form
 * @property {carto.FeatureStyle} style
 * @api
 */

/**
 *
 * FeatureStyle objects can be accessed through {@link carto.Feature} objects.
 * @typedef {Object} FeatureStyle
 * @property {FeatureStyleProperty} color
 * @property {FeatureStyleProperty} width
 * @property {FeatureStyleProperty} colorStroke
 * @property {FeatureStyleProperty} widthStroke
 * @property {Function} reset reset custom feature styles by fading out `duration` milliseconds, where `duration` is the first parameter to reset
 * @api
 */

/**
 *
 * FeatureStyleProperty objects can be accessed through {@link carto.FeatureStyle} objects.
 * @typedef {Object} FeatureStyleProperty
 * @property {Function} blendTo change the feature style by blending to a destination style expression `expr` in `duration` milliseconds, where `expr` is the first parameter and `duration` the last one
 * @property {Function} reset reset custom feature style property by fading out `duration` milliseconds, where `duration` is the first parameter to reset
 * @api
 */


/**
 * featureClick events are fired when the user clicks on features. The list of features behind the cursor is provided.
 *
 * @event featureClick
 * @type {FeatureEvent}
 * @api
 */

/**
 * featureClickOut events are fired when the user clicks outside a feature that was clicked in the last featureClick event.
 * The list of features that were clicked before and that are no longer behind this new click is provided.
 *
 * @event featureClickOut
 * @type {FeatureEvent}
 * @api
 */

/**
 * featureEnter events are fired when the user moves the cursor and the movement implies that a non-previously hovered feature is now under the cursor.
 * The list of features that are now behind the cursor and that weren't before is provided.
 *
 * @event featureEnter
 * @type {FeatureEvent}
 * @api
 */

/**
 * featureHover events are fired when the user moves the cursor.
 * The list of features behind the cursor is provided.
 *
 * @event featureHover
 * @type {FeatureEvent}
 * @api
 */

/**
 * featureLeave events are fired when the user moves the cursor and the movement implies that a previously hovered feature is no longer behind the cursor.
 * The list of features that are no longer behind the cursor and that were before is provided.
 *
 * @event featureLeave
 * @type {FeatureEvent}
 * @api
 */

const EVENTS = [
    'featureClick',
    'featureClickOut',
    'featureEnter',
    'featureHover',
    'featureLeave',
];
export default class Interactivity {
    /**
    *
    * Interactivity purpose is to allow the reception and management of user-generated events, like clicking, over layer features.
    *
    * To create a Interactivity object an array of {@link carto.Layer} is required.
    * Events fired from interactivity objects will refer to the features of these layers and only these layers.
    *
    * @param {carto.Layer|Array<carto.Layer>} layerList - {@link carto.Layer} or array of {@link carto.Layer}, events will be fired based on the features of these layers. The array cannot be empty, and all the layers must be attached to the same map.
    *
    * @example
    * const layer = new carto.Layer('layer', source, style);
    * const interactivity = new carto.Interactivity(layer);
    * interactivity.on('click', event => console.log(event));
    * layer.addTo(myMap);
    *
    * @fires CartoError
    *
    * @constructor Interactivity
    * @memberof carto
    * @api
    */
    constructor(layerList) {
        if (layerList instanceof Layer) {
            // Allow one layer as input
            layerList = [layerList];
        }
        preCheckLayerList(layerList);
        this._init(layerList);
    }

    /**
     * Register an event handler for the given type.
     *
     * @param {string} eventName - type of event to listen for
     * @param {function} callback - function to call in response to given event, function will be called with a {@link carto.FeatureEvent}
     * @memberof carto.Interactivity
     * @instance
     * @api
     */
    on(eventName, callback) {
        checkEvent(eventName);
        return this._emitter.on(eventName, callback);
    }

    /**
     * Remove an event handler for the given type.
     *
     * @param {string} eventName - type of event to unregister
     * @param {function} callback - handler function to unregister
     * @memberof carto.Interactivity
     * @instance
     * @api
     */
    off(eventName, callback) {
        checkEvent(eventName);
        return this._emitter.off(eventName, callback);
    }

    _init(layerList) {
        this._emitter = mitt();
        this._layerList = layerList;
        this._prevHoverFeatures = [];
        this._prevClickFeatures = [];
        Promise.all(layerList.map(layer => layer._context)).then(() => {
            postCheckLayerList(layerList);
            this._subscribeToIntegratorEvents(layerList[0].getIntegrator());
        });
    }

    _subscribeToIntegratorEvents(integrator) {
        integrator.on('mousemove', this._onMouseMove.bind(this));
        integrator.on('click', this._onClick.bind(this));
    }

    _onMouseMove(event) {
        const featureEvent = this._createFeatureEvent(event);
        const currentFeatures = featureEvent.features;

        // Manage enter/leave events
        const featuresLeft = this._getDiffFeatures(this._prevHoverFeatures, currentFeatures);
        const featuresEntered = this._getDiffFeatures(currentFeatures, this._prevHoverFeatures);

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

        this._prevHoverFeatures = featureEvent.features;

        // Launch hover event
        this._fireEvent('featureHover', featureEvent);
    }

    _onClick(event) {
        const featureEvent = this._createFeatureEvent(event);
        const currentFeatures = featureEvent.features;

        // Manage clickOut event
        const featuresClickedOut = this._getDiffFeatures(this._prevClickFeatures, currentFeatures);

        if (featuresClickedOut.length > 0) {
            this._fireEvent('featureClickOut', {
                coordinates: featureEvent.coordinates,
                position: featureEvent.position,
                features: featuresClickedOut
            });
        }

        this._prevClickFeatures = featureEvent.features;

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
        const IDs = this._getFeatureIDs(featuresB);
        return featuresA.filter(feature => !IDs.includes(feature.id));
    }

    _getFeatureIDs(features) {
        return features.map(feature => feature.id);
    }
}

function preCheckLayerList(layerList) {
    if (!Array.isArray(layerList)) {
        throw new Error('Invalid layer list, parameter must be an array of carto.Layer objects');
    }
    if (!layerList.length) {
        throw new Error('Invalid argument, layer list must not be empty');
    }
    if (!layerList.every(layer => layer instanceof Layer)) {
        throw new Error('Invalid layer, layer must be an instance of carto.Layer');
    }
}
function postCheckLayerList(layerList) {
    if (!layerList.every(layer => layer.getIntegrator() == layerList[0].getIntegrator())) {
        throw new Error('Invalid argument, all layers must belong to the same map');
    }
}

function checkEvent(eventName) {
    if (!EVENTS.includes(eventName)) {
        throw new Error(`Unrecognized event: ${eventName}. Availiable events: ${EVENTS.join(', ')}`);
    }
}
