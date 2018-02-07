import getMGLIntegrator from './mglintegrator';

let uid = 0;


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
        console.log("L", this);
    }
    setSource(source) {
        this._source._free();
        this._source = source;
        this._getData();
    }
    setStyle(style) {
        this._style.onChange(null);
        style.onChange(this._styleChanged.bind(this));
        this._style = style;
        this._dataframes.map(dataframe => {
            if (dataframe.style) {
                dataframe.style = this._style;
            }
        });
        this._styleChanged();
    }
    _styleChanged() {
        if (!this._cleanFN) {
            return;
        }
        this._getData();
        // This should probably be part of the renderer but...
        this.metadataPromise.then(metadata => {
            this._style._compileColorShader(this._mglIntegrator.renderer.gl, metadata);
            this._style._compileWidthShader(this._mglIntegrator.renderer.gl, metadata);
            this._style._compileStrokeColorShader(this._mglIntegrator.renderer.gl, metadata);
            this._style._compileStrokeWidthShader(this._mglIntegrator.renderer.gl, metadata);
        });
    }
    _getViewport() {
        if (this._mglIntegrator) {
            return this._mglIntegrator.renderer.getBounds();
        }
        throw new Error('?')
    }
    _getData() {
        if (!this._cleanFN) {
            return;
        }
        const r = this._source._getData(this._getViewport(), this._style.getMinimumNeededSchema(),
            dataframe => {
                this._dataframes.push(dataframe);
                this._mglIntegrator.renderer.addDataframe(dataframe);
                dataframe.setStyle(null);
                this._cleanFN();
            },
            dataframe => {
                if (!this._style) {
                    console.log(this._style)
                }
                dataframe.setStyle(this._style);
            });
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
            const callbackID = `_cartoGL_${uid++}`;
            this._mglIntegrator.registerMoveObserver(callbackID, this._getData.bind(this));
            map.addLayer({
                id: this._name,
                type: 'webgl',
                layout: {
                    callback: callbackID,
                }
            }, beforeLayerID);
            map.repaint = true;

            window[callbackID] = (gl, clean) => {
                this._dataframes.map(dataframe => {
                    if (dataframe.style) {
                        dataframe.style = this._style;
                    }
                });

                // TODO remove this hack
                if (!this._cleanFN) {
                    this._cleanFN = clean;
                    this._styleChanged();
                }

                if (!this._mglIntegrator.renderer.gl) {
                    this._mglIntegrator.renderer._initGL(gl);
                }
                if (map.repaint) {
                    //map.repaint = false;
                }
                this._mglIntegrator.renderer.refresh(Number.NaN);
                clean();
            };

        });
    }
    //TODO free layer resources
}