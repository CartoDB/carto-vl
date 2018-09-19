import mitt from 'mitt';
import util from './utils/util';
import Viz from './Viz';
import SourceBase from './sources/Base';
import Renderer from './renderer/Renderer';
import RenderLayer from './renderer/RenderLayer';
import CartoValidationError, { CartoValidationTypes as cvt } from '../src/errors/carto-validation-error';
import CartoRuntimeError from '../src/errors/carto-runtime-error';

import { cubic } from './renderer/viz/expressions';
import { layerVisibility } from './constants/layer';

// There is one renderer per map, so the layers added to the same map
// use the same renderer with each renderLayer
const renderers = new WeakMap();

/**
*
* A Layer is the primary way to visualize geospatial data.
*
* To create a layer a {@link carto.source.Base|source} and {@link carto.Viz|viz} are required:
*
* - The {@link carto.source.Base|source} is used to know **what** data will be displayed in the Layer.
* - The {@link carto.Viz|viz} is used to know **how** to draw the data in the Layer, Viz instances can only be bound to one single layer.
*
* @param {string} id - The ID of the layer. Can be used in the {@link addTo|addTo} function
* @param {carto.source.Base} source - The source of the data
* @param {carto.Viz} viz - The description of the visualization of the data
*
* @example
* const layer = new carto.Layer('layer0', source, viz);
*
* @fires CartoError
*
* @constructor Layer
* @memberof carto
* @api
*/
export default class Layer {
    constructor (id, source, viz) {
        this._checkId(id);
        this._checkSource(source);
        this._checkViz(viz);
        this._init(id, source, viz);
    }

    _init (id, source, viz) {
        viz._boundLayer = this;
        this._context = new Promise((resolve) => {
            this._contextInitialize = resolve;
        });

        /* Custom Layer API attributes:
          - id: string
          - type: "custom"
        */
        this.id = id;
        this.type = 'custom';

        this.metadata = null;
        this._state = 'init';
        this._visible = true;
        this._isLoaded = false;
        this._matrix = null;
        this._fireUpdateOnNextRender = false;
        this._emitter = mitt();
        this._oldDataframes = new Set();
        this._renderLayer = new RenderLayer();
        this._atomicChangeUID = 0;

        this.update(source, viz);
    }

    /**
     * Get layer visibility. Can be 'visible' or 'none'.
     * @readonly
     */
    get visibility () {
        return this._visible ? layerVisibility.VISIBLE : layerVisibility.HIDDEN;
    }

    /**
     * Get layer visibility. Can be true or false.
     * @readonly
     */
    get visible () {
        return this._visible;
    }

    /**
     * Register an event handler for the given event name. Valid names are: `loaded`, `updated`.
     *
     * @param {string} eventName - Type of event to listen for
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
     * @param {string} eventName - Type of event to unregister
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
     * Update the layer with a new Source and a new Viz object, replacing the current ones. The update is done atomically, i.e.: the viz will be changed with the source, not before it.
     * This method will return a promise that will be resolved once the source and the visualization are validated.
     * The promise will be rejected if the validation fails, for example because the visualization expects a property name that is not present in the source.
     * The promise will be rejected also if this method is invoked again before the first promise is resolved.
     * If the promise is rejected the layer's source and viz won't be changed.
     * @param {carto.source.Base} source - The new Source object
     * @param {carto.Viz?} viz - Optional. The new Viz object
     * @memberof carto.Layer
     * @instance
     * @async
     * @api
     */
    async update (source, viz) {
        if (viz === undefined) {
            // Use current viz
            viz = this._viz;
        }
        this._checkSource(source);
        this._checkViz(viz);

        source = source._clone();
        this._atomicChangeUID++;
        const uid = this._atomicChangeUID;
        const loadImagesPromise = viz.loadImages();
        const metadata = await source.requestMetadata(viz);
        await loadImagesPromise;

        await this._context;
        if (this._atomicChangeUID > uid) {
            throw new CartoRuntimeError('Another atomic change was done before this one committed (1)');
        }

        // Everything was ok => commit changes
        this.metadata = metadata;

        source.bindLayer(this._onDataframeAdded.bind(this), this._onDataLoaded.bind(this));

        if (this._source !== source) {
            this._freeSource();
        }

        this._source = source;
        this.requestData();

        viz.setDefaultsIfRequired(this.metadata.geomType);
        await this._context;
        if (this._atomicChangeUID > uid) {
            throw new CartoRuntimeError('Another atomic change was done before this one committed (2)');
        }

        if (this._viz) {
            this._viz.onChange(null);
        }
        viz.setDefaultsIfRequired(this._renderLayer.type);
        this._viz = viz;
        viz.onChange(this._vizChanged.bind(this));
        this._compileShaders(viz, metadata);
        this._needRefresh();
    }

    /**
     * Blend the current viz with another viz.
     *
     * This allows smooth transforms between two different vizs.
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
        viz.setDefaultsIfRequired(this.metadata.geomType);
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

        return this._vizChanged(viz).then(() => {
            if (this._viz) {
                this._viz.onChange(null);
            }
            viz.setDefaultsIfRequired(this._renderLayer.type);
            this._viz = viz;
            this._viz.onChange(this._vizChanged.bind(this));
        });
    }

    /**
     * Viz attached to this layer.
     *
     * Calls to `blendToViz` and `update` wont' update the viz until those calls "commit",
     * having performed and completed all asynchronous necessary sanity checks.
     *
     * @returns {carto.Viz} - Viz object currently bound to the layer
     * @memberof carto.Layer
     * @api
     */
    get viz () {
        return this._viz;
    }

    /**
     * Change layer visibility to visible
     *
     * @memberof carto.Layer
     * @instance
     * @api
     *
     * @fires updated
     */
    show () {
        this.map.setLayoutProperty(this.id, 'visibility', 'visible');
        this._visible = true;
        this.requestData();
    }

    /**
     * Change layer visibility to hidden
     *
     * @memberof carto.Layer
     * @instance
     * @api
     *
     * @fires updated
     */
    hide () {
        this.map.setLayoutProperty(this.id, 'visibility', 'none');
        this._visible = false;
        this._fire('updated');
    }

    async requestMetadata (viz) {
        viz = viz || this._viz;
        if (!viz) {
            return;
        }
        return this._source.requestMetadata(viz);
    }

    async requestData (matrix) {
        // Set renderer zoom and center
        this._setZoomCenter(matrix);

        if (!this.metadata || !this._visible) {
            return;
        }

        this._source.requestData(this._getZoom(), this._getViewport());
        this._fireUpdateOnNextRender = true;
    }

    hasDataframes () {
        return this._renderLayer.hasDataframes();
    }

    getNumFeatures () {
        return this._renderLayer.getNumFeatures();
    }

    getFeaturesAtPosition (pos) {
        return this._visible
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
        // Call request data if the matrix has changed
        if (!util.equalArrays(this._matrix, matrix)) {
            this._matrix = matrix;
            this.renderer.matrix = matrix;
            this.requestData(matrix);
        }
    }

    /**
     * Custom Layer API: `render` function
     */
    render (gl, matrix) {
        this._paintLayer();

        if (this.isAnimated()) {
            this._needRefresh();
        }
    }

    _paintLayer () {
        if (this._viz && this._viz.colorShader) {
            this._renderLayer.setViz(this._viz);
            this.renderer.renderLayer(this._renderLayer, {
                zoomLevel: this.map.getZoom()
            });
            const dataframesHaveChanged = !util.isSetsEqual(this._oldDataframes, new Set(this._renderLayer.getActiveDataframes()));
            if (this.isAnimated() || this._fireUpdateOnNextRender || dataframesHaveChanged) {
                this._oldDataframes = new Set(this._renderLayer.getActiveDataframes());
                this._fireUpdateOnNextRender = false;
                this._fire('updated');
            }

            if (!this._isLoaded && this._state === 'dataLoaded') {
                this._isLoaded = true;
                this._fire('loaded');
            }
        }
    }

    _fire (eventType, eventData) {
        try {
            return this._emitter.emit(eventType, eventData);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Callback executed when the client adds a new dataframe
     * @param {Dataframe} dataframe
     */
    _onDataframeAdded (dataframe) {
        dataframe.setFreeObserver(() => {
            this._needRefresh();
        });
        this._renderLayer.addDataframe(dataframe);
        if (this._viz) {
            this._viz.setDefaultsIfRequired(dataframe.type);
        }
        this._needRefresh();
    }

    _needRefresh () {
        this.map.triggerRepaint();
    }

    /**
     * Callback executed when the client finishes loading data
     */
    _onDataLoaded () {
        this._state = 'dataLoaded';
        this._needRefresh();
    }

    _addLayerIdToFeature (feature) {
        feature.layerId = this.id;
        return feature;
    }

    _compileShaders (viz, metadata) {
        viz.compileShaders(this.gl, metadata);
    }

    async _vizChanged (viz) {
        if (this._cache) {
            return this._cache;
        }
        this._cache = this._requestVizChanges(viz)
            .then(() => { this._cache = null; });
        return this._cache;
    }

    async _requestVizChanges (viz) {
        await this._context;
        if (!this._source) {
            throw new CartoValidationError(`${cvt.MISSING_REQUIRED} a 'source' is required before changing the viz.`);
        }

        const source = this._source;
        const loadImagesPromise = viz.loadImages();
        const metadata = await source.requestMetadata(viz);
        await loadImagesPromise;

        if (this._source !== source) {
            throw new CartoRuntimeError('A source change was made before the metadata was retrieved, therefore, metadata is stale and it cannot be longer consumed');
        }
        this.metadata = metadata;
        this._compileShaders(viz, this.metadata);
        this._needRefresh();
        return this.requestData();
    }

    _checkId (id) {
        if (util.isUndefined(id)) {
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
        if (util.isUndefined(source)) {
            throw new CartoValidationError(`${cvt.MISSING_REQUIRED} 'source'`);
        }
        if (!(source instanceof SourceBase)) {
            throw new CartoValidationError(`${cvt.INCORRECT_TYPE} The given object is not a valid 'source'. See "carto.source.Base".`);
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

    _setZoomCenter (matrix) {
        let zoom;
        let center;

        if (matrix) {
            // Compute the zoom and center from the matrix.
            // This is a solution to avoid subscribing to map events and
            // make a better and efficient use of the Custom Layers interface.
            // TODO: the best solution is to use the matrix at the shader
            // level and remove the aspect and scale logic from the renderer
            zoom = util.computeMatrixZoom(matrix);
            center = util.computeMatrixCenter(matrix);
        } else {
            zoom = util.computeMapZoom(this.map);
            center = util.computeMapCenter(this.map);
        }

        this.renderer.setZoom(zoom);
        this.renderer.setCenter(center);
    }

    _getViewport () {
        function invert (out, a) {
            let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
            let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
            let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
            let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

            let b00 = a00 * a11 - a01 * a10;
            let b01 = a00 * a12 - a02 * a10;
            let b02 = a00 * a13 - a03 * a10;
            let b03 = a01 * a12 - a02 * a11;
            let b04 = a01 * a13 - a03 * a11;
            let b05 = a02 * a13 - a03 * a12;
            let b06 = a20 * a31 - a21 * a30;
            let b07 = a20 * a32 - a22 * a30;
            let b08 = a20 * a33 - a23 * a30;
            let b09 = a21 * a32 - a22 * a31;
            let b10 = a21 * a33 - a23 * a31;
            let b11 = a22 * a33 - a23 * a32;

            // Calculate the determinant
            let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

            if (!det) {
                return null;
            }
            det = 1.0 / det;

            out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
            out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
            out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
            out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
            out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
            out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
            out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
            out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
            out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
            out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
            out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
            out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
            out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
            out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
            out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
            out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

            return out;
        }
        function transformMat4 (out, a, m) {
            let x = a[0], y = a[1], z = a[2], w = a[3];
            out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
            out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
            out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
            out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
            return out;
        }

        const inv = invert([], this._matrix);

        // Compute the WebMercator position at projected (x,y) NDC (Normalized Device Coordinates) reversing the projection of the point
        function unproject (x, y) {
            // To unproject a point we need the 3 coordinates (x,y,z)
            // The `z` coordinate can be computed by knowing that the unprojected `z` is equal to `0` (since the map is a 2D plane)
            // defined at `z=0`

            // Since a matrix-vector multiplication is a linear transform we know that
            //      z = m * projectedZ + k
            // Being `m` and `k` constants for a particular value of projected `x` and `y` coordinates

            // With that equation and the inverse matrix of the projection we can establish an equation system of the form:
            //      v1 = m * v2 + k
            //      v3 = m * v4 + k
            // Where `v2` and `v4` can be arbitrary values (but not equal to each other) and
            // `v1` and `v3` can be computed by using the inverse matrix knowing that:
            //      (_, _, v1,_) = inverse(projectionMatrix) * (projectedX, projectedY, v2, 1)
            //      (_, _, v3,_) = inverse(projectionMatrix) * (projectedX, projectedY, v4, 1)

            // By resolving the the equation system above computing `m` and `k` values
            // we can compute the projected Z coordinate at the (x,y) NDC (projected) point

            // With (projectedX, projectedY, projectedZ) we can compute the unprojected point by multiplying by the inverse matrix

            // *** Implementation ***

            // compute m, k for: [z = m*projectedZ + k]
            const v2 = 1;
            const v4 = 2;

            const v1 = transformMat4([], [x, y, v2, 1], inv)[2];
            const v3 = transformMat4([], [x, y, v4, 1], inv)[2];

            // Solve the equation system by using the elimination method (subtraction of the equations)
            //      (v1-v3) = (v2-v4)*m
            //      m = (v1 - v3) / (v2 - v4)
            const m = (v1 - v3) / (v2 - v4);
            // Substituting in the first equation `m` and solving for `k`
            const k = v1 - m * v2;

            // compute projectedZ by solving `z = m * projectedZ + k` knwoing `z`, `m` and `k`
            const projectedZ = -k / m;

            // Inverse the projection and normalize by `p.w`
            return transformMat4([], [x, y, projectedZ, 1], inv).map((v, _, point) => v / point[3]);
        }
        const corners = [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ].map(NDC =>
            unproject(...NDC)
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

/**
 *
 * LayerEvent objects are fired by {@link carto.Layer|Layer} objects.
 *
 * @typedef {object} LayerEvent
 * @api
 */

/**
 * A loaded event is fired once the layer is firstly loaded. Loaded events won't be fired after the initial load.
 *
 * @event loaded
 * @type {LayerEvent}
 * @api
 */

/**
 * Updated events are fired every time that viz variables could have changed, like: map panning, map zooming, source data loading or viz changes.
 * This is useful to create external widgets that are refreshed reactively to changes in the CARTO VL map.
 *
 * @event updated
 * @type {LayerEvent}
 * @api
*/
