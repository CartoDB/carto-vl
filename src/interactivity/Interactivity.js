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

const MAP_STATE = {
    IDLE: 'idle',
    MOVING: 'moving'
};

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
            layerList = [layerList]; // Allow one layer as input
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
        const currentCount = this._numListeners[eventName] || 0;
        this._numListeners[eventName] = currentCount + 1;
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
        const currentCount = this._numListeners[eventName];
        this._numListeners[eventName] = currentCount - 1;
        return this._emitter.off(eventName, callback);
    }

    /**
    * Interactivity enabled property. When enabled, it can emit events
    *
    * @type {boolean}
    * @memberof carto.Interactivity
    * @instance
    * @api
    */
    get isEnabled () {
        return this._enabled && this._mapState !== MAP_STATE.MOVING;
    }

    /**
     * Change interactivity state to disabled, so no event will be emitted
     *
     * @memberof carto.Interactivity
     * @instance
     * @api
     */
    disable () {
        this._enabled = false;
    }

    /**
     * Change interactivity state to enabled, so events can be emitted
     *
     * @memberof carto.Interactivity
     * @instance
     * @api
     */
    enable () {
        this._enabled = true;
    }

    _init (layerList, options) {
        this._enabled = true;
        this._mapState = MAP_STATE.IDLE;
        this._emitter = mitt();
        this._layerList = layerList;
        this._prevHoverFeatures = [];
        this._prevClickFeatures = [];
        this._numListeners = {};

        const allLayersReadyPromises = layerList.map(layer => layer._context);
        return Promise.all(allLayersReadyPromises)
            .then(() => {
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
        if (!map.__carto_interactivities) {
            map.__carto_interactivities = new Set();
        }
        this.on('featureHover', event => {
            if (event.features.length) {
                map.__carto_interactivities.add(this);
            } else {
                map.__carto_interactivities.delete(this);
            }
            map.getCanvas().style.cursor = (map.__carto_interactivities.size > 0) ? 'pointer' : '';
        });
    }

    _subscribeToMapEvents (map) {
        map.on('mousemove', this._onMouseMove.bind(this));
        map.on('click', this._onClick.bind(this));
        this._disableWhileMovingMap(map);
    }

    _disableWhileMovingMap (map) {
        map.on('movestart', () => {
            this._setMapState(MAP_STATE.MOVING);
        });

        map.on('moveend', () => {
            this._setMapState(MAP_STATE.IDLE);
        });
    }

    _setMapState (state) {
        this._mapState = state;
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

        if (!this.isEnabled) {
            return;
        }

        if (!event ||
            (!this._numListeners['featureEnter'] &&
                !this._numListeners['featureHover'] &&
                !this._numListeners['featureLeave'])) {
            return;
        }

        const featureEvent = this._createFeatureEvent(event);

        const featuresLeft = this._manageFeatureLeaveEvent(featureEvent);
        const featuresEntered = this._manageFeatureEnterEvent(featureEvent);

        this._prevHoverFeatures = featureEvent.features;
        this._manageFeatureHoverEvent(featureEvent, { featuresLeft, featuresEntered }, emulated);
    }

    _manageFeatureLeaveEvent (featureEvent) {
        const featuresLeft = this._getDiffFeatures(this._prevHoverFeatures, featureEvent.features);
        this._fireEventIfFeatures('featureLeave', { featureEvent, eventFeatures: featuresLeft });
        return featuresLeft;
    }

    _manageFeatureEnterEvent (featureEvent) {
        const featuresEntered = this._getDiffFeatures(featureEvent.features, this._prevHoverFeatures);
        this._fireEventIfFeatures('featureEnter', { featureEvent, eventFeatures: featuresEntered });
        return featuresEntered;
    }

    _manageFeatureHoverEvent (featureEvent, { featuresLeft, featuresEntered }, emulated) {
        // If the event comes from a real mouse move, trigger always (because coordinates and position have changed)
        // If the event comes from an animated event, trigger only when features have changed (because position is the same)
        if (!emulated || (emulated && (featuresLeft.length || featuresEntered.length))) {
            // Launch hover event
            this._fireEvent('featureHover', featureEvent);
        }
    }

    _fireEventIfFeatures (eventName, { featureEvent, eventFeatures }) {
        if (eventFeatures.length > 0) {
            this._fireEvent(eventName, {
                coordinates: featureEvent.coordinates,
                position: featureEvent.position,
                features: eventFeatures
            });
        }
    }

    _onClick (event) {
        if (!this.isEnabled) {
            return;
        }

        if (!this._numListeners['featureClick'] &&
            !this._numListeners['featureClickOut']) {
            return;
        }

        const featureEvent = this._createFeatureEvent(event);
        this._manageClickOutEvent(featureEvent);

        this._prevClickFeatures = featureEvent.features;

        // Launch click event
        this._fireEvent('featureClick', featureEvent);
    }

    _manageClickOutEvent (featureEvent) {
        const featuresClickedOut = this._getDiffFeatures(this._prevClickFeatures, featureEvent.features);
        this._fireEventIfFeatures('featureClickOut', { featureEvent, eventFeatures: featuresClickedOut });
        return featuresClickedOut;
    }

    _createFeatureEvent (eventData) {
        // a potentially very intensive task
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
