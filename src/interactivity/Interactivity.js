import mitt from 'mitt';
import Layer from '../Layer';
import CartoValidationError, { CartoValidationTypes as cvt } from '../errors/carto-validation-error';

const EVENTS = [
    'featureClick',
    'featureClickOut',
    'featureEnter',
    'featureHover',
    'featureLeave'
];

export default class Interactivity {
    /**
    *
    * Interactivity purpose is to allow the reception and management of user-generated events, like clicking, over layer features.
    *
    * To create a Interactivity object a {@link carto.Layer} or an array with several {@link carto.Layer} is required.
    * Events fired from interactivity objects will refer to the features of these layer/s and only these layer/s.
    * Moreover, when using an array of layers, the order of the features in the events will be determined by the order of these layers in the layerList.
    *
    * @param {carto.Layer|carto.Layer[]} layerList - {@link carto.Layer} or array of {@link carto.Layer}, events will be fired based on the features of these layers. The array cannot be empty, and all the layers must be attached to the same map.
    * @param {Object} [options={}] - Object containing interactivity options
    * @param {boolean} [options.autoChangePointer=true] - A boolean flag indicating if the cursor should change when the mouse is over a feature.
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
    * @throws CartoError
    *
    * @constructor Interactivity
    * @name carto.Interactivity
    * @api
    */
    constructor (layerList, options = { autoChangePointer: true }) {
        if (layerList instanceof Layer) {
            // Allow one layer as input
            layerList = [layerList];
        }
        preCheckLayerList(layerList);
        this._init(layerList, options);
    }

    /**
     * Register an event handler for the given type.
     *
     * @param {String} eventName - Type of event to listen for
     * @param {function} callback - Function to call in response to given event, function will be called with a {@link carto.FeatureEvent}
     * @memberof carto.Interactivity
     * @instance
     * @api
     */
    on (eventName, callback) {
        checkEvent(eventName);
        this._numListeners[eventName] = (this._numListeners[eventName] || 0) + 1;
        return this._emitter.on(eventName, callback);
    }

    /**
     * Remove an event handler for the given type.
     *
     * @param {String} eventName - Type of event to unregister
     * @param {function} callback - Handler function to unregister
     * @memberof carto.Interactivity
     * @instance
     * @api
     */
    off (eventName, callback) {
        checkEvent(eventName);
        this._numListeners[eventName] = this._numListeners[eventName] - 1;
        return this._emitter.off(eventName, callback);
    }

    _init (layerList, options) {
        this._emitter = mitt();
        this._layerList = layerList;
        this._prevHoverFeatures = [];
        this._prevClickFeatures = [];
        this._numListeners = {};
        return Promise.all(layerList.map(layer => layer._context)).then(() => {
            postCheckLayerList(layerList);
            this._subscribeToLayerEvents(layerList);
            this._subscribeToMapEvents(layerList[0].map);
        }).then(() => {
            if (options.autoChangePointer) {
                this._setInteractiveCursor();
            }
        });
    }

    _setInteractiveCursor () {
        const map = this._layerList[0].map; // All layers belong to the same map
        if (!map.__carto_interacivities) {
            map.__carto_interacivities = new Set();
        }
        this.on('featureHover', event => {
            if (event.features.length) {
                map.__carto_interacivities.add(this);
            } else {
                map.__carto_interacivities.delete(this);
            }
            map.getCanvas().style.cursor = (map.__carto_interacivities.size > 0) ? 'pointer' : '';
        });
    }

    _subscribeToMapEvents (map) {
        map.on('mousemove', this._onMouseMove.bind(this));
        map.on('click', this._onClick.bind(this));
    }

    _subscribeToLayerEvents (layers) {
        layers.forEach(layer => {
            layer.on('updated', this._onLayerUpdated.bind(this));
        });
    }

    _onLayerUpdated () {
        this._onMouseMove(this._mouseEvent, true);
    }

    _onMouseMove (event, emulated) {
        // Store mouse event to be used in `onLayerUpdated`
        this._mouseEvent = event;

        if (!event ||
            (!this._numListeners['featureEnter'] &&
                !this._numListeners['featureHover'] &&
                !this._numListeners['featureLeave'])) {
            return;
        }

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

        this._prevHoverFeatures = currentFeatures;

        // If the event comes from a real mouse move, trigger always (because coordinates and position have changed)
        // If the event comes from an animated event, trigger only when features have changed (because position is the same)
        if (!emulated || (emulated && (featuresLeft.length || featuresEntered.length))) {
            // Launch hover event
            this._fireEvent('featureHover', featureEvent);
        }
    }

    _onClick (event) {
        if (!this._numListeners['featureClick'] &&
            !this._numListeners['featureClickOut']) {
            return;
        }

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

    _createFeatureEvent (eventData) {
        const features = this._getFeaturesAtPosition(eventData.point);
        return {
            coordinates: eventData.lngLat,
            position: eventData.point,
            features
        };
    }

    _fireEvent (type, featureEvent) {
        this._emitter.emit(type, featureEvent);
    }

    _getFeaturesAtPosition (point) {
        return [].concat(...this._layerList.map(layer => layer.getFeaturesAtPosition(point)));
    }

    /**
     * Return the difference between the feature arrays A and B.
     * The output value is also an array of features.
     */
    _getDiffFeatures (featuresA, featuresB) {
        const IDs = this._getFeatureIDs(featuresB);
        return featuresA.filter(feature => !IDs.includes(feature.id));
    }

    _getFeatureIDs (features) {
        return features.map(feature => feature.id);
    }
}

function preCheckLayerList (layerList) {
    if (!Array.isArray(layerList)) {
        throw new CartoValidationError(`${cvt.INCORRECT_TYPE} Invalid layer list, parameter must be an array of "carto.Layer" objects.`);
    }
    if (!layerList.length) {
        throw new CartoValidationError(`${cvt.INCORRECT_VALUE} Invalid argument, layer list must not be empty.`);
    }
    if (!layerList.every(layer => layer instanceof Layer)) {
        throw new CartoValidationError(`${cvt.INCORRECT_TYPE} Invalid layer, layer must be an instance of "carto.Layer".`);
    }
}
function postCheckLayerList (layerList) {
    if (!layerList.every(layer => layer.map === layerList[0].map)) {
        throw new CartoValidationError(`${cvt.INCORRECT_VALUE} Invalid argument, all layers must belong to the same map.`);
    }
}

function checkEvent (eventName) {
    if (!EVENTS.includes(eventName)) {
        throw new CartoValidationError(`${cvt.INCORRECT_VALUE} Unrecognized event: '${eventName}'. Available events: ${EVENTS.join(', ')}.`);
    }
}
