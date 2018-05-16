import mitt from 'mitt';
import Layer from './layer';
import { WM_R, projectToWebMercator } from './util';
import { wToR } from '../client/rsys';

/**
 *
 * FeatureEvent objects are fired by {@link carto.Interactivity|Interactivity} objects.
 *
 * @typedef {object} FeatureEvent
 * @property {object} coordinates - LongLat coordinates in { lng, lat } form
 * @property {object} position - Pixel coordinates in { x, y } form
 * @property {Feature[]} features - Array of {@link Feature}
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
    * Moreover, the order of the features in the events will be determined by the order of the layers in this list.
    *
    * @param {carto.Layer|carto.Layer[]} layerList - {@link carto.Layer} or array of {@link carto.Layer}, events will be fired based on the features of these layers. The array cannot be empty, and all the layers must be attached to the same map.
    *
    * @example
    * const interactivity = new carto.Interactivity(layer);
    * interactivity.on('click', event => {
    *   style(event.features);
    *   show(event.coordinates);
    * });
    *
    * @fires featureClick
    * @fires featureClickOut
    * @fires featureHover
    * @fires featureEnter
    * @fires featureLeave
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
     * @param {string} eventName - Type of event to listen for
     * @param {function} callback - Function to call in response to given event, function will be called with a {@link carto.FeatureEvent}
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
     * @param {string} eventName - Type of event to unregister
     * @param {function} callback - Handler function to unregister
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
        return Promise.all(layerList.map(layer => layer._context)).then(() => {
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
