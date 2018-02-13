import getMGLIntegrator from './mglintegrator';

import * as _ from 'lodash';

import SourceBase from './source/base';

/**
 * Responsabilities:  rely style changes into MNS source notifications, notify renderer about style changes, notify source about viewport changes,
 * rely dataframes to renderer, configure visibility for all source dataframes, set up MGL integration (opionally)
 */
export default class Layer {

    constructor(id, source, style) {
        this._checkId(id);
        this._checkSource(source);
        this._checkStyle(style);

        this._lastViewport = null;
        this._lastMNS = null;
        this._mglIntegrator = null;
        this._dataframes = [];

        this._id = id;
        this.setSource(source);
        this.setStyle(style);

        console.log('L', this);
    }

    _checkId(id) {
        if (_.isUndefined(id)) {
            throw new Error('layer', 'idRequired');
        }
        if (!_.isString(id)) {
            throw new Error('layer', 'idString');
        }
        if (_.isEmpty(id)) {
            throw new Error('layer', 'nonValidId');
        }
    }

    _checkSource(source) {
        if (_.isUndefined(source)) {
            throw new Error('layer', 'sourceRequired');
        }
        if (!(source instanceof SourceBase)) {
            throw new Error('layer', 'nonValidSource');
        }
    }

    _checkStyle(style) {
        if (_.isUndefined(style)) {
            throw new Error('layer', 'styleRequired');
        }
    }

    /**
     * [setSource description]
     * @param {[type]} source [description]
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
            this._source._free();
        }
        this._source = source;
    }

    /**
     * [setStyle description]
     * @param {[type]} style [description]
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
     * [addTo description]
     * @param {[type]} map           [description]
     * @param {[type]} beforeLayerID [description]
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

    _styleChanged() {
        if (!(this._mglIntegrator && this._mglIntegrator.invalidateMGLWebGLState)) {
            return;
        }
        this._getData();
        const originalPromise = this.metadataPromise;
        this.metadataPromise.then(metadata => {
            // We should only compile the shaders if the metadata came from the original promise
            // if not, we would be compiling with a stale metadata
            if (originalPromise == this.metadataPromise) {
                this._style._compileColorShader(this._mglIntegrator.renderer.gl, metadata);
                this._style._compileWidthShader(this._mglIntegrator.renderer.gl, metadata);
                this._style._compileStrokeColorShader(this._mglIntegrator.renderer.gl, metadata);
                this._style._compileStrokeWidthShader(this._mglIntegrator.renderer.gl, metadata);
            }
        });
    }

    _getViewport() {
        if (this._mglIntegrator) {
            return this._mglIntegrator.renderer.getBounds();
        }
        throw new Error('?');
    }

    _getData() {
        if (!this._mglIntegrator.invalidateMGLWebGLState) {
            return;
        }
        const r = this._source.requestData(this._getViewport(), this._style.getMinimumNeededSchema());
        if (r) {
            this.metadataPromise = r;
            r.then(() => this._styleChanged());
        }
    }

    _addToMGLMap(map, beforeLayerID) {
        map.on('load', () => {
            this._mglIntegrator = getMGLIntegrator(map);
            this._mglIntegrator.addLayer(this._id, beforeLayerID, this._getData.bind(this), () => {
                this._dataframes.map(
                    dataframe => {
                        dataframe.setStyle(this._style);
                        dataframe.visible = true;
                    });
                this._mglIntegrator.renderer.refresh(Number.NaN);
                this._dataframes.map(
                    dataframe => {
                        dataframe.visible = false;
                    });
            });
        });
    }
    //TODO free layer resources
}
