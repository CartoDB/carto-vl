import mitt from 'mitt';
import util from './utils/util';
import Viz from './Viz';
import SourceBase from './sources/Base';
import Renderer from './renderer/Renderer';
import RenderLayer from './renderer/RenderLayer';
import CartoValidationError, { CartoValidationTypes as cvt } from '../src/errors/carto-validation-error';
import CartoRuntimeError from '../src/errors/carto-runtime-error';

import { cubic } from './renderer/viz/expressions';
import { mat4 } from 'gl-matrix';
import { unproject } from './utils/geometry';

// There is one renderer per map, so the layers added to the same map
// use the same renderer with each renderLayer
const renderers = new WeakMap();

const states = Object.freeze({
    INIT: 'init', // Initial state until the Source is rendered for the first time
    IDLE: 'idle', // The Source has been rendered for the first time already, but there are no scheduled updates
    UPDATING: 'updating' // The Source has been rendered for the first time already and there is a scheduled update
});

/**
*
* A Layer is the primary way to visualize geospatial data.
*
* To create a layer a {@link carto.source|source} and {@link carto.Viz|viz} are required:
*
* - The {@link carto.source|source} is used to know **what** data will be displayed in the Layer.
* - The {@link carto.Viz|viz} is used to know **how** to draw the data in the Layer, Viz instances can only be bound to one single layer.
*
* @param {String} id - The ID of the layer. Can be used in the {@link addTo|addTo} function
* @param {carto.source} source - The source of the data
* @param {carto.Viz} viz - The description of the visualization of the data
* @throws CartoError
*
* @example
* const layer = new carto.Layer('layer0', source, viz);
*
* @constructor Layer
* @name carto.Layer
* @api
*/

export default class Layer {
    constructor (id, source, viz) {
        this._checkId(id);
        this._checkSource(source);
        this._checkViz(viz);

        /* Mapbox GL Custom Layer API attributes:
          - id: string
          - type: "custom"
        */
        this.id = id;
        this.type = 'custom';

        viz._boundLayer = this;
        this._context = new Promise(resolve => {
            this._contextInitialize = resolve;
        });

        this._state = states.INIT;
        this._visible = true;
        this._emitter = mitt();
        this._renderLayer = new RenderLayer();

        // There are 2 type of changes in a layer source or viz:
        //  - Major changes. Major changes are performed by the `update` method and they will override (have priority over) minor changes
        //  - Minor changes. Minor changes are performed by the `blendToViz` and `blendTo` method and they won't override concurrent calls to `update`
        // The public docs of `update` and `blendToViz` explains this API particularity in more detail, which is implemented with these counters
        this._majorNextUID = 0;
        this._majorCurrentUID = null;
        this._minorNextUID = 0;
        this._minorCurrentUID = null;

        this._sourcePromise = this.update(source, viz);
    }

    /**
     * Layer visibility property.
     *
     * @type {boolean}
     * @memberof carto.Layer
     * @instance
     * @api
     */
    get visible () {
        return this._visible;
    }

    set visible (visible) {
        this.map.setLayoutProperty(this.id, 'visibility', visible ? 'visible' : 'none');
        this._visible = visible;
    }

    /**
     * Change layer visibility to visible
     *
     * @memberof carto.Layer
     * @instance
     * @api
     * @fires updated
     */
    show () {
        this.visible = true;
    }

    /**
     * Change layer visibility to hidden
     *
     * @memberof carto.Layer
     * @instance
     * @api
     * @fires updated
     */
    hide () {
        this.visible = false;
    }

    /**
     * Register an event handler for the given event name.
     *
     * @param {String} eventName - Type of event to listen for. Valid names are: `loaded`, `updated`.
     * @param {function} callback - Function to call in response to given event
     * @memberof carto.Layer
     * @instance
     * @api
     */
    on (eventName, callback) {
        return this._emitter.on(eventName, callback);
    }

    /**
     * Remove an event handler for the given type.
     *
     * @param {String} eventName - Type of event to unregister. Valid names are: `loaded`, `updated`.
     * @param {function} callback - Handler function to unregister
     * @memberof carto.Layer
     * @instance
     * @api
     */
    off (eventName, callback) {
        return this._emitter.off(eventName, callback);
    }

    /**
     * Add this layer to a map. If the map's style is not loaded yet it will wait for it to add the layer as soon as possible.
     *
     * @param {mapboxgl.Map} map - The map on which to add the layer
     * @param {string?} beforeLayerID - The ID of an existing layer to insert the new layer before. If this values is not passed the layer will be added on the top of the existing layers.
     * @memberof carto.Layer
     * @instance
     * @api
     */
    addTo (map, beforeLayerID) {
        const STYLE_ERROR_REGEX = /Style is not done loading/;

        try {
            map.addLayer(this, beforeLayerID);
        } catch (error) {
            if (!STYLE_ERROR_REGEX.test(error)) {
                throw new CartoRuntimeError(`Error adding layer to map: ${error}`);
            }

            map.on('load', () => {
                map.addLayer(this, beforeLayerID);
            });
        }
    }

    /**
     * Remove this layer from the map. It should be called after the layer is loaded. Otherwise, it will not delete the layer.
     *
     * @memberof carto.Layer
     * @instance
     * @api
     */
    remove () {
        if (this.map) {
            this.map.removeLayer(this.id);
        }
    }

    /**
     * Update the layer with a new Source and a new Viz object, replacing the current ones. The update is done atomically, i.e.:
     * the viz will be changed with the source, not before it.
     *
     * This method will return a promise that will be resolved once the source and the visualization are validated.
     *
     * The promise will be rejected if the validation fails, for example
     * because the visualization expects a property name that is not present in the source.
     *
     * The promise will be rejected also if this method is invoked again before the first promise is resolved.
     * If the promise is rejected the layer's source and viz won't be changed by this call.
     *
     * Concurrent calls to `blendToViz` or `blendTo` won't override calls to update (like calls to `update` do).
     *
     * @param {carto.source} source - The new Source object.
     * @param {carto.Viz?} viz - Optional. The new Viz object. Defaults to the current viz.
     * @memberof carto.Layer
     * @instance
     * @async
     * @api
     */
    async update (source, viz = this._viz) {
        return this._update(source, viz, true);
    }
    async _update (source, viz, majorChange) {
        this._checkSource(source);
        this._checkViz(viz);

        if (source !== this._source) {
            source = source._clone();
        }

        let uid;
        if (majorChange) {
            uid = { major: this._majorNextUID, minor: 0 };
            this._majorNextUID++;
        } else {
            uid = { major: this._majorCurrentUID, minor: this._minorNextUID };
            this._minorNextUID++;
        }

        const loadImagesPromise = viz.loadImages();

        // Don't await directly to start requesting the images as soon as possible
        const metadataPromise = source.requestMetadata(viz);
        await loadImagesPromise;
        const metadata = await metadataPromise;

        await this._context;

        if (majorChange) {
            if (this._majorCurrentUID > uid.major) {
                throw new CartoRuntimeError(`Another \`Layer.update()\` finished before this one. Commit ${uid} overridden by commit ${this._majorCurrentUID}.`);
            }
        } else {
            if (this._majorCurrentUID > uid.major) {
                throw new CartoRuntimeError(`Another \`Layer.update()\` finished before this viz change. Commit ${uid} overridden by commit ${this._majorCurrentUID}.${this._minorCurrentUID}`);
            }
            if (this._minorCurrentUID > uid.minor) {
                throw new CartoRuntimeError(`Another \`viz change\` finished before this one. Commit ${uid.major}.${uid.minor} overridden by commit ${this._majorCurrentUID}.${this._minorCurrentUID}`);
            }
        }
        this._majorCurrentUID = uid.major;
        this._minorCurrentUID = uid.minor;

        // Everything was ok => commit changes
        this.metadata = metadata;

        viz.setDefaultsIfRequired(this.metadata.geomType);
        viz.setDefaultsIfRequired(this._renderLayer.type);
        if (this._viz) {
            this._viz.onChange(null);
        }
        this._viz = viz;
        viz.onChange(this._vizChanged.bind(this));
        this.viz.clearShaders();
        this.viz.metadata = metadata;
        this.viz.gl = this.gl;
        this._needRefresh();

        source.bindLayer(this._onDataframeAdded.bind(this), this._onDataLoaded.bind(this));
        if (this._source !== source) {
            this._freeSource();
        }

        this._source = source;
    }

    /**
     * Blend the current viz with another viz.
     *
     * This allows smooth transitions between two different Vizs.
     *
     * Blending won't be performed when convenient for the attached Source. This
     * happens with Maps API sources when the new Viz uses a different set of properties or
     * aggregations. In these cases a hard transition will be used instead.
     *
     * This method returns a promise that will be resolved if validations passed.
     *
     * The promise will be rejected if the validation fails, for example
     * because the visualization expects a property name that is not present in the source.
     *
     * The promise will be rejected also if this method is invoked again before the first promise is resolved.
     * If the promise is rejected the layer's viz won't be changed by this call.
     *
     * Concurrent calls to `update` will override the effects of `blendToViz`:
     * if a call to `blendToViz` is performed after a call to `update`, but the `update` hasn't been resolved yet,
     * the call to `update` will override the call to `blendToViz` is it resolves.
     *
     * @example <caption> Smooth transition variating point size </caption>
     * // We create two different vizs varying the width
     * const viz0 = new carto.Viz({ width: 10 });
     * const viz1 = new carto.Viz({ width: 20 });
     * // Create a layer with the first viz
     * const layer = new carto.Layer('layer', source, viz0);
     * // We add the layer to the map, the points in this layer will have widh 10
     * layer.addTo(map, 'layer0');
     * // The points will be animated from 10px to 20px for 500ms.
     * layer.blendToViz(viz1, 500);
     *
     * @param {carto.Viz} viz - The final viz
     * @param {number} [duration=400] - The animation duration in milliseconds
     *
     * @memberof carto.Layer
     * @instance
     * @async
     * @api
     */
    async blendToViz (viz, ms = 400, interpolator = cubic) {
        this._checkViz(viz);
        await this._sourcePromise;
        if (this._viz && !this._source.requiresNewMetadata(viz)) {
            Object.keys(this._viz.variables).map(varName => {
                viz.variables[varName] = this._viz.variables[varName];
            });

            viz.color._blendFrom(this._viz.color, ms, interpolator);
            viz.strokeColor._blendFrom(this._viz.strokeColor, ms, interpolator);
            viz.width._blendFrom(this._viz.width, ms, interpolator);
            viz.strokeWidth._blendFrom(this._viz.strokeWidth, ms, interpolator);
            viz.filter._blendFrom(this._viz.filter, ms, interpolator);
            // FIXME viz.symbol._blendFrom(this._viz.symbol, ms, interpolator);
            // FIXME viz.symbolPlacement._blendFrom(this._viz.symbolPlacement, ms, interpolator);
        }
        return this._update(this._source, viz, false);
    }

    /**
     * Viz attached to this layer.
     *
     * Calls to `blendToViz` and `update` won't update the viz until those calls "commit",
     * having performed and completed all asynchronous necessary sanity checks.
     *
     * @type {carto.Viz}
     * @memberof carto.Layer
     * @readonly
     * @api
     */
    get viz () {
        return this._viz;
    }

    hasDataframes () {
        return this._renderLayer.hasDataframes();
    }

    getNumFeatures () {
        return this._renderLayer.getNumFeatures();
    }

    getFeaturesAtPosition (pos) {
        return this.visible
            ? this._renderLayer.getFeaturesAtPosition(pos).map(this._addLayerIdToFeature.bind(this))
            : [];
    }

    isAnimated () {
        return this._viz && this._viz.isAnimated();
    }

    /**
     * Custom Layer API: `onAdd` function
     */
    onAdd (map, gl) {
        this.gl = gl;
        this.map = map;
        this.renderer = _getRenderer(map, gl);

        // Initialize render layer
        this._renderLayer.setRenderer(this.renderer);
        this._contextInitialize();
    }

    /**
     * Custom Layer API: `onRemove` function
     */
    onRemove (map, gl) {
    }

    /**
     * Custom Layer API: `prerender` function
     */
    prerender (gl, matrix) {
        this.renderer.matrix = matrix;
        if (this._source && this.visible) {
            this._source.requestData(this._getZoom(), this._getViewport(matrix));
        }
    }

    /**
     * Custom Layer API: `render` function
     */
    render (gl, matrix) {
        if (this._state === states.INIT && this._renderLayer.getActiveDataframes().length === 0) {
            return;
        }

        this._paintLayer();

        const state = this._state;
        this._state = states.IDLE;
        if (this.isAnimated()) {
            this._needRefresh();
        }

        if (state === states.INIT) {
            this._fire('loaded');
            this._fire('updated');
        } else if (state === states.UPDATING) {
            this._fire('updated');
        }
    }

    _paintLayer () {
        this._renderLayer.setViz(this._viz);
        this.renderer.renderLayer(this._renderLayer, {
            zoomLevel: this.map.getZoom()
        });
    }

    _fire (eventType, eventData) {
        // We don't want to fire an event within MGL custom layer callback since an error there
        // would crash MGL renderer
        // We fire the event asynchronously to be safe
        new Promise(resolve => {
            this._emitter.emit(eventType, eventData);
            resolve();
        });
    }

    /**
     * Callback executed when the client adds a new dataframe
     * @param {Dataframe} dataframe
     */
    _onDataframeAdded (dataframe) {
        this._renderLayer.addDataframe(dataframe);
        if (this._viz) {
            this._viz.setDefaultsIfRequired(dataframe.type);
        }
        this._needRefresh();
    }

    _needRefresh () {
        if (this._state !== states.INIT) {
            this._state = states.UPDATING;
        }
        this.map.triggerRepaint();
    }

    _onDataLoaded () {
        this._needRefresh();
    }

    _addLayerIdToFeature (feature) {
        feature.layerId = this.id;
        return feature;
    }

    async _vizChanged (viz) {
        return this._update(this._source, viz, false);
    }

    _checkId (id) {
        if (id === undefined) {
            throw new CartoValidationError(`${cvt.MISSING_REQUIRED} 'id'`);
        }
        if (!util.isString(id)) {
            throw new CartoValidationError(`${cvt.INCORRECT_TYPE} 'id' property must be a string.`);
        }
        if (id === '') {
            throw new CartoValidationError(`${cvt.INCORRECT_VALUE} 'id' property must be not empty.`);
        }
    }

    _checkSource (source) {
        if (source === undefined) {
            throw new CartoValidationError(`${cvt.MISSING_REQUIRED} 'source'`);
        }
        if (!(source instanceof SourceBase)) {
            throw new CartoValidationError(`${cvt.INCORRECT_TYPE} The given object is not a valid 'source'. See "carto.source".`);
        }
    }

    _checkViz (viz) {
        if (util.isUndefined(viz)) {
            throw new CartoValidationError(`${cvt.MISSING_REQUIRED} 'viz'`);
        }
        if (!(viz instanceof Viz)) {
            throw new CartoValidationError(`${cvt.INCORRECT_TYPE} The given object is not a valid 'viz'. See "carto.Viz".`);
        }
        if (viz._boundLayer && viz._boundLayer !== this) {
            throw new CartoValidationError(`${cvt.INCORRECT_VALUE} The given Viz object is already bound to another layer. Vizs cannot be shared between different layers.`);
        }
    }

    _getViewport (matrix) { // TODO move to util, check rsys
        const inv = mat4.invert([], matrix);

        const corners = [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ].map(NDC =>
            unproject(inv, ...NDC)
        ).map(c =>
            // Our API works on the [-1,1] range, convert from [0,1] range to  [-1, 1] range
            c.map(x => x * 2 - 1)
        );

        // Rotation no longer gurantees that corners[0] will be the minimum point of the AABB and corners[3] the maximum,
        // we need to compute the AABB min/max by iterating
        const min = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
        const max = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
        corners.forEach(corner => {
            min[0] = Math.min(min[0], corner[0]);
            min[1] = Math.min(min[1], corner[1]);
            max[0] = Math.max(max[0], corner[0]);
            max[1] = Math.max(max[1], corner[1]);
        });

        // Our API flips the `y` coordinate, we need to convert the values accordingly
        min[1] = -min[1];
        max[1] = -max[1];
        const temp = min[1];
        min[1] = max[1];
        max[1] = temp;

        return [...min, ...max];
    }

    _getZoom () {
        return this.map.getZoom();
    }

    _freeSource () {
        if (this._source) {
            this._source.free();
        }
        this._renderLayer.freeDataframes();
    }
}

function _getRenderer (map, gl) {
    if (!renderers.get(map)) {
        const renderer = new Renderer();
        renderer.initialize(gl);
        renderers.set(map, renderer);
    }
    return renderers.get(map);
}
