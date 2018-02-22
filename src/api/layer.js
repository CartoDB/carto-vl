import * as _ from 'lodash';

import SourceBase from './source/base';
import Style from './style';
import getMGLIntegrator from './integration/mapbox-gl';
import CartoValidationError from './error-handling/carto-validation-error';
import { cubic } from '../core/style/functions';

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
        this._mglIntegrator = null;
        this._dataframes = [];

        this._id = id;
        this.metadata = null;
        this.setSource(source);
        this.setStyle(style);

        console.log('L', this);
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
                this._mglIntegrator.renderer.addDataframe(dataframe);
                this._mglIntegrator.invalidateMGLWebGLState();
            },
            dataframe => {
                this._dataframes = this._dataframes.filter(d => d !== dataframe);
                this._mglIntegrator.renderer.removeDataframe(dataframe);
                this._mglIntegrator.invalidateMGLWebGLState();
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
        return this._styleChanged(style).then(r => {
            console.log('success set', r);
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
     * Blend the current style with another style
     *
     * @param {carto.Style} style - style to blend to
     *
     * @memberof carto.Layer
     * @api
     */
    blendToStyle(style, ms = 400, interpolator = cubic) {
        this._checkStyle(style);
        if (this._style) {
            style.getColor().blendFrom(this._style.getColor(), ms, interpolator);
            style.getStrokeColor().blendFrom(this._style.getStrokeColor(), ms, interpolator);
            style.getWidth().blendFrom(this._style.getWidth(), ms, interpolator);
            style.getStrokeWidth().blendFrom(this._style.getStrokeWidth(), ms, interpolator);
        }

        return this._styleChanged(style).then(r => {
            console.log('success blend', r);
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
     *
     * @memberof carto.Layer
     * @api
     */
    addTo(map, beforeLayerID) {
        if (this._isMGLMap(map)) {
            this._addToMGLMap(map, beforeLayerID);
        }
        else {
            throw new Error('layer', 'nonValidMap');
        }
    }

    _isMGLMap() {
        // TODO: implement this
        return true;
    }

    _addToMGLMap(map, beforeLayerID) {
        map.on('load', () => {
            this._mglIntegrator = getMGLIntegrator(map);
            this._mglIntegrator.addLayer(this._id, beforeLayerID, this._getData.bind(this), () => {
                this._dataframes.map(
                    dataframe => {
                        dataframe.setStyle(this._style);
                        dataframe.visible = dataframe.active;
                    });
                this._mglIntegrator.renderer.refresh(Number.NaN);
                this._dataframes.map(
                    dataframe => {
                        dataframe.visible = false;
                    });
            }, () => {
                this._styleChanged(this._style);
                this._getData();
            });
        });
    }

    _styleChanged(style) {
        const recompile = (metadata) => {
            style._compileColorShader(this._mglIntegrator.renderer.gl, metadata);
            style._compileWidthShader(this._mglIntegrator.renderer.gl, metadata);
            style._compileStrokeColorShader(this._mglIntegrator.renderer.gl, metadata);
            style._compileStrokeWidthShader(this._mglIntegrator.renderer.gl, metadata);
        };
        if (!(this._mglIntegrator && this._mglIntegrator.invalidateMGLWebGLState)) {
            return Promise.resolve(undefined);
        }
        const originalPromise = this._getData(style);
        if (!originalPromise) {
            const metadata = this.metadata;
            recompile(metadata);
            return Promise.resolve(undefined);
        }
        return originalPromise.then(metadata => {
            this.metadata = metadata;
            recompile(metadata);
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
        if (this._mglIntegrator) {
            return this._mglIntegrator.renderer.getBounds();
        }
        throw new Error('?');
    }

    _getData(style) {
        style = style || this._style;
        if (!this._mglIntegrator.invalidateMGLWebGLState) {
            return;
        }
        var r;
        r = this._source.requestData(this._getViewport(), style.getMinimumNeededSchema(),
            style.getResolution());
        if (r) {
            r.then(() => {
                this._getData(style);
            }, err => { console.log(err); });
            return r;
        }
    }

    getNumFeatures() {
        return this._dataframes.filter(d => d.active).map(d => d.numFeatures).reduce((x, y) => x + y, 0);
    }

    //TODO free layer resources
}
