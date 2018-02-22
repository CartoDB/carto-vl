import * as _ from 'lodash';

import SourceBase from './source/base';
import Style from './style';
import CartoMap from './map';
import getCMIntegrator from './integrator/carto';
import getMGLIntegrator from './integrator/mapbox-gl';
import CartoValidationError from './error-handling/carto-validation-error';

/**
 * Responsabilities: rely style changes into MNS source notifications, notify renderer about style changes, notify source about viewport changes,
 * rely dataframes to renderer, configure visibility for all source dataframes, set up MGL integration (opionally)
 */

export default class Layer {

    /**
     * Create a carto.Layer.
     *
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

        this.id = id;
        this.setSource(source);
        this.setStyle(style);

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
        };
    }

    /**
     * Set a new source for this layer.
     *
     * @param {carto.source.Base} source - New source
     *
     * @memberof carto.Layer
     * @api
     */
    setSource(source) {
        this._checkSource(source);
        source.bindLayer(
            dataframe => {
                this._dataframes.push(dataframe);
                this._integrator.renderer.addDataframe(dataframe);
                this._integrator.invalidateWebGLState();
            },
            dataframe => {
                this._dataframes = this._dataframes.filter(d => d !== dataframe);
                this._integrator.renderer.removeDataframe(dataframe);
                this._integrator.invalidateWebGLState();
            }
        );
        if (this._source && this._source !== source) {
            this._source.free();
        }
        this._source = source;
    }

    /**
     * Set a new style for this layer.
     *
     * @param {carto.Style} style - New style
     *
     * @memberof carto.Layer
     * @api
     */
    setStyle(style) {
        this._checkStyle(style);
        if (this._style) {
            this._style.onChange(null);
        }
        this._style = style;
        this._style.onChange(this._styleChanged.bind(this));
        // Force style changed event
        this._styleChanged();
    }

    /**
     * Add this layer to a map.
     *
     * @param {mapboxgl.Map} map
     * @param {string} beforeLayerID
     *
     * @memberof carto.Layer
     * @api
     */
    addTo(map, beforeLayerID) {
        if (this._isCartoMap(map)) {
            this._addToCartoMap(map);
        } else if (this._isMGLMap(map)) {
            this._addToMGLMap(map, beforeLayerID);
        } else {
            throw new CartoValidationError('layer', 'nonValidMap');
        }
    }
    
    hasDataframes() {
        return this._dataframes.length > 0;
    }

    _isCartoMap(map) {
        return map instanceof CartoMap;
    }

    _isMGLMap() {
        // TODO: implement this
        return true;
    }

    _addToCartoMap(map) {
        this._integrator = getCMIntegrator(map);
        this._integrator.addLayer(this);
    }

    _addToMGLMap(map, beforeLayerID) {
        map.on('load', () => {
            this._integrator = getMGLIntegrator(map);
            this._integrator.addLayer(this, beforeLayerID);
        });
    }

    _styleChanged() {
        if (!(this._integrator && this._integrator.invalidateWebGLState)) {
            return;
        }
        this.getData();
        const originalPromise = this.metadataPromise;
        this.metadataPromise.then(metadata => {
            // We should only compile the shaders if the metadata came from the original promise
            // if not, we would be compiling with a stale metadata
            if (originalPromise == this.metadataPromise) {
                this._style._compileColorShader(this._integrator.renderer.gl, metadata);
                this._style._compileWidthShader(this._integrator.renderer.gl, metadata);
                this._style._compileStrokeColorShader(this._integrator.renderer.gl, metadata);
                this._style._compileStrokeWidthShader(this._integrator.renderer.gl, metadata);
            }
        });
    }

    _checkId(id) {
        if (_.isUndefined(id)) {
            throw new CartoValidationError('layer', 'idRequired');
        }
        if (!_.isString(id)) {
            throw new CartoValidationError('layer', 'idStringRequired');
        }
        if (_.isEmpty(id)) {
            throw new CartoValidationError('layer', 'nonValidId');
        }
    }

    _checkSource(source) {
        if (_.isUndefined(source)) {
            throw new CartoValidationError('layer', 'sourceRequired');
        }
        if (!(source instanceof SourceBase)) {
            throw new CartoValidationError('layer', 'nonValidSource');
        }
    }

    _checkStyle(style) {
        if (_.isUndefined(style)) {
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

    getData() {
        if (!this._integrator.invalidateWebGLState) {
            return;
        }
        const r = this._source.requestData(this._getViewport(), this._style.getMinimumNeededSchema(),
            this._style.getResolution());
        if (r) {
            this.metadataPromise = r;
            r.then(() => this._styleChanged());
        }
    }

    getNumFeatures() {
        return this._dataframes.filter(d => d.active).map(d => d.numFeatures).reduce((x, y) => x + y, 0);
    }

    //TODO free layer resources
}
