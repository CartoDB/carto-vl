import mitt from 'mitt';
import * as util from './util';
import SourceBase from './source/base';
import Style from './style';
import CartoMap from './map';
import getCMIntegrator from './integrator/carto';
import getMGLIntegrator from './integrator/mapbox-gl';
import CartoValidationError from './error-handling/carto-validation-error';
import { cubic } from '../core/style/functions';
import RenderLayer from '../core/renderLayer';


export default class Layer {
    /**
    *
    * A Layer is the primary way to visualize geospatial data.
    *
    * To create a layer a {@link carto.source.Base|source} and {@link carto.Style|style} are required:
    *
    * - The {@link carto.source.Base|source} is used to know **what** data will be displayed in the Layer.
    * - The {@link carto.Style|style} is used to know **how** to draw the data in the Layer.
    *
    * @param {string} id
    * @param {carto.source.Base} source
    * @param {carto.Style} style
    *
    * @example
    * new carto.Layer('layer0', source, style);
    *
    * @fires CartoError
    *
    * @constructor Layer
    * @memberof carto
    * @api
    */
    constructor(id, source, style) {
        this._checkId(id);
        this._checkSource(source);
        this._checkStyle(style);

        this._init(id, source, style);
    }

    _init(id, source, style) {
        style._boundLayer = this;
        this.state = 'init';
        this._id = id;

        this._emitter = mitt();
        this._lastViewport = null;
        this._lastMNS = null;
        this._integrator = null;
        this._context = new Promise((resolve) => {
            this._contextInitCallback = resolve;
        });

        this.metadata = null;
        this._renderLayer = new RenderLayer();
        this.state = 'init';
        this.isLoaded = false;

        this.update(source, style);
    }

    on(eventType, callback) {
        return this._emitter.on(eventType, callback);
    }

    off(eventType, callback) {
        return this._emitter.off(eventType, callback);
    }

    /**
     * Add this layer to a map.
     *
     * @param {mapboxgl.Map} map
     * @param {string} beforeLayerID
     * @memberof carto.Layer
     * @instance
     * @api
     */
    addTo(map, beforeLayerID) {
        if (this._isCartoMap(map)) {
            this._addToCartoMap(map, beforeLayerID);
        } else if (this._isMGLMap(map)) {
            this._addToMGLMap(map, beforeLayerID);
        } else {
            throw new CartoValidationError('layer', 'nonValidMap');
        }
    }

    async update(source, style) {
        this._checkSource(source);
        this._checkStyle(style);
        source = source._clone();
        this._atomicChangeUID = this._atomicChangeUID + 1 || 1;
        const uid = this._atomicChangeUID;
        await this._context;
        const metadata = await source.requestMetadata(style);
        if (this._atomicChangeUID > uid) {
            throw new Error('Another atomic change was done before this one committed');
        }

        // Everything was ok => commit changes
        this.metadata = metadata;

        source.bindLayer(this._onDataframeAdded.bind(this), this._onDataFrameRemoved.bind(this), this._onDataLoaded.bind(this));
        if (this._source !== source) {
            this._freeSource();
        }
        this._source = source;
        this.requestData();

        if (this._style) {
            this._style.onChange(null);
        }
        this._style = style;
        style.onChange(this._styleChanged.bind(this));
        this._compileShaders(style, metadata);
    }

    /**
     * Blend the current style with another style.
     *
     * This allows smooth transforms between two different styles.
     *
     * @example <caption> Smooth transition variating point size </caption>
     * // We create two different styles varying the width
     * const style0 = new carto.style({ width: 10 });
     * const style1 = new carto.style({ width: 20 });
     * // Create a layer with the first style
     * const layer = new carto.Layer('layer', source, style0);
     * // We add the layer to the map, the points in this layer will have widh 10
     * layer.addTo(map, 'layer0');
     * // The points will be animated from 10px to 20px for 500ms.
     * layer.blendToStyle(style1, 500);
     *
     * @param {carto.Style} style - The final style
     * @param {number} duration - The animation duration in milliseconds [default:400]
     * @memberof carto.Layer
     * @instance
     * @api
     */
    blendToStyle(style, ms = 400, interpolator = cubic) {
        this._checkStyle(style);
        if (this._style) {
            style.getColor().blendFrom(this._style.getColor(), ms, interpolator);
            style.getStrokeColor().blendFrom(this._style.getStrokeColor(), ms, interpolator);
            style.getWidth().blendFrom(this._style.getWidth(), ms, interpolator);
            style.getStrokeWidth().blendFrom(this._style.getStrokeWidth(), ms, interpolator);
            style.getFilter().blendFrom(this._style.getFilter(), ms, interpolator);
        }

        this._styleChanged(style).then(() => {
            if (this._style) {
                this._style.onChange(null);
            }
            this._style = style;
            this._style.onChange(this._styleChanged.bind(this));
        });
    }

    // The integrator will call this method once the webgl context is ready.
    initCallback() {
        this._renderLayer.renderer = this._integrator.renderer;
        this._contextInitCallback();
        this.requestMetadata();
    }

    async requestMetadata(style) {
        style = style || this._style;
        if (!style) {
            return;
        }
        await this._context;
        return this._source.requestMetadata(style);
    }

    async requestData() {
        if (!this.metadata) {
            return;
        }
        this._source.requestData(this._getViewport());
    }

    hasDataframes() {
        return this._renderLayer.hasDataframes();
    }

    getId() {
        return this._id;
    }

    getSource() {
        return this._source;
    }

    getStyle() {
        return this._style;
    }

    getNumFeatures() {
        return this._renderLayer.getNumFeatures();
    }

    getIntegrator() {
        return this._integrator;
    }

    getFeaturesAtPosition(pos) {
        return this._renderLayer.getFeaturesAtPosition(pos).map(this._addLayerIdToFeature.bind(this));
    }

    $paintCallback() {
        if (this._style && this._style.colorShader) {
            this._renderLayer.style = this._style;
            this._integrator.renderer.renderLayer(this._renderLayer);
        }
        if (!this.isLoaded && this.state == 'dataLoaded') {
            this._fire('loaded');
            this.isLoaded = true;
        }
    }

    _fire(eventType, eventData) {
        return this._emitter.emit(eventType, eventData);
    }

    /**
     * Callback executed when the client adds a new dataframe
     * @param {Dataframe} dataframe
     */
    _onDataframeAdded(dataframe) {
        this._renderLayer.addDataframe(dataframe);
        this._integrator.invalidateWebGLState();
        this._integrator.needRefresh();
    }

    /**
     * Callback executed when the client removes dataframe
     * @param {Dataframe} dataframe
     */
    _onDataFrameRemoved(dataframe) {
        this._renderLayer.removeDataframe(dataframe);
        this._integrator.invalidateWebGLState();
    }

    /**
     * Callback executed when the client finishes loading data
     */
    _onDataLoaded() {
        this.state = 'dataLoaded';
    }

    _addLayerIdToFeature(feature) {
        feature.layerId = this._id;
        return feature;
    }

    _isCartoMap(map) {
        return map instanceof CartoMap;
    }

    _isMGLMap() {
        // TODO: implement this
        return true;
    }

    _addToCartoMap(map, beforeLayerID) {
        this._integrator = getCMIntegrator(map);
        this._integrator.addLayer(this, beforeLayerID);
    }

    _addToMGLMap(map, beforeLayerID) {
        if (map.isStyleLoaded()) {
            this._onMapLoaded(map, beforeLayerID);
        } else {
            map.on('load', () => {
                this._onMapLoaded(map, beforeLayerID);
            });
        }
    }

    _onMapLoaded(map, beforeLayerID) {
        this._integrator = getMGLIntegrator(map);
        this._integrator.addLayer(this, beforeLayerID);
    }

    _compileShaders(style, metadata) {
        style.compileShaders(this._integrator.renderer.gl, metadata);
    }

    async _styleChanged(style) {
        await this._context;
        if (!this._source) {
            throw new Error('A source is required before changing the style');
        }
        const source = this._source;
        const metadata = await source.requestMetadata(style);
        if (this._source !== source) {
            throw new Error('A source change was made before the metadata was retrieved, therefore, metadata is stale and it cannot be longer consumed');
        }
        this.metadata = metadata;
        this._compileShaders(style, this.metadata);
        this._integrator.needRefresh();
        return this.requestData();
    }

    _checkId(id) {
        if (util.isUndefined(id)) {
            throw new CartoValidationError('layer', 'idRequired');
        }
        if (!util.isString(id)) {
            throw new CartoValidationError('layer', 'idStringRequired');
        }
        if (id === '') {
            throw new CartoValidationError('layer', 'nonValidId');
        }
    }

    _checkSource(source) {
        if (util.isUndefined(source)) {
            throw new CartoValidationError('layer', 'sourceRequired');
        }
        if (!(source instanceof SourceBase)) {
            throw new CartoValidationError('layer', 'nonValidSource');
        }
    }

    _checkStyle(style) {
        if (util.isUndefined(style)) {
            throw new CartoValidationError('layer', 'styleRequired');
        }
        if (!(style instanceof Style)) {
            throw new CartoValidationError('layer', 'nonValidStyle');
        }
        if (style._boundLayer && style._boundLayer !== this) {
            throw new CartoValidationError('layer', 'sharedStyle');
        }
    }

    _getViewport() {
        if (this._integrator) {
            return this._integrator.renderer.getBounds();
        }
        throw new Error('?');
    }

    _freeSource() {
        if (this._source) {
            this._source.free();
        }
        this._renderLayer.freeDataframes();
    }
}
