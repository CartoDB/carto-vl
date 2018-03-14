import * as util from './util';
import SourceBase from './source/base';
import Style from './style';
import CartoMap from './map';
import getCMIntegrator from './integrator/carto';
import getMGLIntegrator from './integrator/mapbox-gl';
import CartoValidationError from './error-handling/carto-validation-error';
import { cubic } from '../core/style/functions';


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

        this._lastViewport = null;
        this._lastMNS = null;
        this._integrator = null;
        this._dataframes = [];
        this._context = new Promise((resolve) => {
            this._contextInitCallback = resolve;
        });

        this._id = id;
        this.metadata = null;
        this.setSource(source);
        this.setStyle(style);

        this._listeners = {};

        this.state = 'init';
        console.log('L', this);

        this.paintCallback = () => {
            this._dataframes.map(
                dataframe => {
                    dataframe.setStyle(this._style);
                    dataframe.visible = dataframe.active;
                });
            this._integrator.renderer.refresh(Number.NaN);
            this._dataframes.map(
                dataframe => {
                    dataframe.visible = false;
                });
            if (this.state == 'dataLoaded') {
                this.state = 'dataPainted';
                this._fire('loaded');
            }
        };
    }

    _fire(eventType, eventData) {
        if (!this._listeners[eventType]) {
            return;
        }
        this._listeners[eventType].map(listener => listener(eventData));
    }

    on(eventType, callback) {
        if (!this._listeners[eventType]) {
            this._listeners[eventType] = [callback];
        } else {
            this._listeners[eventType].push(callback);
        }
    }
    off(eventType, callback) {
        const index = this._listeners[eventType].indexOf(callback);
        this._listeners[eventType].splice(index, 1);
    }

    /**
     * Set a new source for this layer.
     *
     * @param {carto.source.Base} source - New source
     * @memberof carto.Layer
     * @instance
     * @api
     */
    setSource(source) {
        this._checkSource(source);
        source.bindLayer(this._onDataframeAdded.bind(this), this._onDataFrameRemoved.bind(this), this._onDataLoaded.bind(this));
        if (this._source && this._source !== source) {
            this._source.free();
        }
        this._source = source;
    }

    /**
     * Callback executed when the client adds a new dataframe
     * @param {Dataframe} dataframe
     */
    _onDataframeAdded(dataframe) {
        this._dataframes.push(dataframe);
        this._integrator.renderer.addDataframe(dataframe);
        this._integrator.invalidateWebGLState();
    }

    /**
     * Callback executed when the client removes dataframe
     * @param {Dataframe} dataframe
     */
    _onDataFrameRemoved(dataframe) {
        this._dataframes = this._dataframes.filter(d => d !== dataframe);
        this._integrator.renderer.removeDataframe(dataframe);
        this._integrator.invalidateWebGLState();
    }

    /**
    * Callback executed when the client finishes loading data
    */
    _onDataLoaded() {
        this.state = 'dataLoaded';
    }

    /**
     * Set a new style for this layer.
     *
     * This transition happens instantly, for smooth animations use {@link carto.Layer#blendToStyle|blendToStyle}
     *
     * @param {carto.Style} style - New style
     * @memberof carto.Layer
     * @instance
     * @api
     */
    setStyle(style) {
        this._checkStyle(style);
        return this._styleChanged(style).then(r => {
            if (this._style) {
                this._style.onChange(null);
            }
            this._style = style;
            this._style.onChange(() => {
                this._styleChanged(style);
            });
            return r;
        });
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
     * const layer = new carto.Layer(source, style);
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
            style.filter.blendFrom(this._style.filter, ms, interpolator);
        }

        return this._styleChanged(style).then(r => {
            if (this._style) {
                this._style.onChange(null);
            }
            this._style = style;
            this._style.onChange(() => {
                this._styleChanged(style);
            });
            return r;
        });
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

    hasDataframes() {
        return this._dataframes.length > 0;
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

    initCallback() {
        this._contextInitCallback();
        this.requestData();
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
        style._compileColorShader(this._integrator.renderer.gl, metadata);
        style._compileWidthShader(this._integrator.renderer.gl, metadata);
        style._compileStrokeColorShader(this._integrator.renderer.gl, metadata);
        style._compileStrokeWidthShader(this._integrator.renderer.gl, metadata);
        style._compileFilterShader(this._integrator.renderer.gl, metadata);
    }
    async _styleChanged(style) {
        await this._context;
        const originalPromise = this.requestData(style);
        if (!originalPromise) {
            // The previous stored metadata is still valid
            this._compileShaders(style, this.metadata);
            return Promise.resolve();
        }
        // this.metadata needs to be updated, try to get new metadata and update this.metadata and proceed if everything works well
        return originalPromise.then(metadata => {
            this.metadata = metadata;
            this._compileShaders(style, metadata);
            this.requestData(style);
        });
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
    }

    _getViewport() {
        if (this._integrator) {
            return this._integrator.renderer.getBounds();
        }
        throw new Error('?');
    }

    async requestData(style) {
        style = style || this._style;
        if (!style) {
            return;
        }
        await this._context;
        return this._source.requestData(this._getViewport(), style);
    }

    getNumFeatures() {
        return this._dataframes.filter(d => d.active).map(d => d.numFeatures).reduce((x, y) => x + y, 0);
    }

    //TODO free layer resources
}
