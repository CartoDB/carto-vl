import getMGLIntegrator from './mglintegrator';

/**
 * Responsabilities:  rely style changes into MNS source notifications, notify renderer about style changes, notify source about viewport changes,
 * rely dataframes to renderer, configure visibility for all source dataframes, set up MGL integration (opionally)
 */
export default class Layer {
    constructor(name, source, style) {
        this._name = name;
        this._source = source;
        this._style = style;
        this._lastViewport = null;
        this._lastMNS = null;
        this._mglIntegrator = null;
        this._dataframes = [];

        style.onChange(this._styleChanged.bind(this));
        this.setSource(source);
        console.log('L', this);
    }
    setSource(source) {
        source._bindLayer(
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
    setStyle(style) {
        this._style.onChange(null);
        style.onChange(this._styleChanged.bind(this));
        this._style = style;
        this._styleChanged();
    }
    _styleChanged() {
        if (!this._mglIntegrator.invalidateMGLWebGLState) {
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
        const r = this._source._getData(this._getViewport(), this._style.getMinimumNeededSchema());
        if (r) {
            this.metadataPromise = r;
            r.then(() => this._styleChanged());
        }
    }
    addTo(map, beforeLayerID) {
        // TODO check map type
        this._addToMGLMap(map, beforeLayerID);
    }
    _addToMGLMap(map, beforeLayerID) {
        map.on('load', () => {
            this._mglIntegrator = getMGLIntegrator(map);
            this._mglIntegrator.addLayer(this._name, beforeLayerID, this._getData.bind(this), () => {
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