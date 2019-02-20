// CartoMap depends on gl-matrix, which after imported is globally available as 'mat4'
// Constants extracted from /carto-vl/src/constants/layer.js
const RESOLUTION_ZOOMLEVEL_ZERO = 512;

/**
 * @description A simple non-interactive map used for tests
 */
class CartoMap { // eslint-disable-line no-unused-vars
    /**
     * Create a simple CartoMap by specifying a container `id`.
     *
     * @param  {Object} options
     * @param  {String} options.container The element's string `id`.
     *
     * @constructor CartoMap
     */
    constructor (options) {
        options = options || {};

        if (typeof options.container === 'string') {
            const container = window.document.getElementById(options.container);
            if (!container) {
                throw new Error(`CartoValidation: Missing required container '${options.container}' not found.`);
            } else {
                this._container = container;
            }
        }

        this._background = options.background || '';

        this._layers = new Set();
        this._hiddenLayers = new Set();
        this._canvas = this._createCanvas();
        this._container.appendChild(this._canvas);
        this._gl = this._canvas.getContext('webgl');
        this._resizeCanvas(this._containerDimensions());
    }

    on (event, callback) {
        if (event === 'load') {
            callback && callback();
        }
    }

    once () {

    }

    addLayer (layer, beforeLayerID) {
        if (!this._layers.has(layer)) {
            this._layers.add(layer);
        }

        layer.onAdd(this, this._gl);

        window.requestAnimationFrame(this._update.bind(this));
    }

    removeLayer (layer) {
        if (this._layers.has(layer)) {
            this._layers.remove(layer);
        }

        layer.onRemove(this);
    }

    getZoom () {
        return Math.log2(this._canvas.height / RESOLUTION_ZOOMLEVEL_ZERO);
    }

    getCenter () {
        return { lat: 0, lng: 0 };
    }

    hide (layer) {
        if (this._layers.has(layer)) {
            this._layers.delete(layer);
            this._hiddenLayers.add(layer);
        }
    }

    show (layer) {
        if (this._hiddenLayers.has(layer)) {
            this._hiddenLayers.delete(layer);
            this._layers.add(layer);
        }
    }

    _update (timestamp) {
        // Don't re-render more than once per animation frame
        if (this.lastFrame === timestamp) {
            return;
        }

        this.lastFrame = timestamp;

        this._drawBackground(this._background);

        let loaded = true;
        let animated = false;

        this._layers.forEach((layer) => {
            const hasData = layer.hasDataframes();
            const hasAnimation = layer.isAnimated();
            layer.prerender(this._gl, this._matrix);

            if (hasData || hasAnimation) {
                layer.render(this._gl, this._matrix);
            }

            loaded = loaded && hasData;
            animated = animated || hasAnimation;
        });

        // Update until all layers are loaded or there is an animation
        if (!loaded || animated) {
            window.requestAnimationFrame(this._update.bind(this));
        }
    }

    _drawBackground (color) {
        switch (color) {
            case 'black':
                this._gl.clearColor(0, 0, 0, 1);
                this._gl.clear(this._gl.COLOR_BUFFER_BIT);
                break;
            case 'red':
                this._gl.clearColor(1, 0, 0, 1);
                this._gl.clear(this._gl.COLOR_BUFFER_BIT);
                break;
            case 'green':
                this._gl.clearColor(0, 1, 0, 1);
                this._gl.clear(this._gl.COLOR_BUFFER_BIT);
                break;
            case 'blue':
                this._gl.clearColor(0, 0, 1, 1);
                this._gl.clear(this._gl.COLOR_BUFFER_BIT);
                break;
            default:
            // white
        }
    }

    _createCanvas () {
        const canvas = window.document.createElement('canvas');

        canvas.className = 'canvas';
        canvas.style.position = 'absolute';

        return canvas;
    }

    _containerDimensions () {
        let width = 0;
        let height = 0;

        if (this._container) {
            width = this._container.offsetWidth || 400;
            height = this._container.offsetHeight || 300;
        }

        return { width, height };
    }

    _resizeCanvas (size) {
        const pixelRatio = window.devicePixelRatio || 1;

        this._canvas.width = pixelRatio * size.width;
        this._canvas.height = pixelRatio * size.height;

        this._canvas.style.width = `${size.width}px`;
        this._canvas.style.height = `${size.height}px`;

        this._matrix = this._createMatrix();
    }

    _createMatrix () {
        const ratio = this._canvas.width / this._canvas.height;

        const m = [];
        mat4.identity(m);
        mat4.scale(m, m, [2, 1, 1]);
        mat4.translate(m, m, [-0.5, 0, 0]);

        const m2 = [];
        mat4.ortho(m2, -ratio, ratio, 1, 0, 0, 1);
        mat4.multiply(m, m2, m);

        return m;
    }

    triggerRepaint () {
        window.requestAnimationFrame(this._update.bind(this));
    }
}
