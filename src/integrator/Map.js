import { layerVisibility } from '../constants/layer';
/**
 * @description A simple non-interactive map.
 */

export default class Map {
    /**
     * Create a simple carto.Map by specifying a container `id`.
     *
     * @param  {object} options
     * @param  {string} options.container The element's string `id`.
     *
     * @constructor Map
     * @memberof carto
     */
    constructor (options) {
        options = options || {};

        if (typeof options.container === 'string') {
            const container = window.document.getElementById(options.container);
            if (!container) {
                throw new Error(`Container '${options.container}' not found.`);
            } else {
                this._container = container;
            }
        }

        this._background = options.background || '';

        this._layers = new Set();
        this._hiddenLayers = new Set();
        this._repaint = true;
        this.invalidateWebGLState = () => {};
        this._canvas = this._createCanvas();
        this._container.appendChild(this._canvas);
        this._gl = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl');
        this._resizeCanvas(this._containerDimensions());
    }

    addLayer (layer, beforeLayerID) {
        layer.initialize();

        if (!this._layers.has(layer)) {
            this._layers.add(layer);
        }

        window.requestAnimationFrame(this.update.bind(this));
    }

    update (timestamp) {
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
            const hasAnimation = layer.getViz() && layer.getViz().isAnimated();

            if (hasData || hasAnimation) {
                layer.$paintCallback();
            }

            loaded = loaded && hasData;
            animated = animated || hasAnimation;
        });

        // Update until all layers are loaded or there is an animation
        if (!loaded || animated) {
            window.requestAnimationFrame(this.update.bind(this));
        }
    }

    changeVisibility (layer) {
        switch (layer.visibility) {
            case layerVisibility.VISIBLE:
                this.show(layer);
                break;
            case layerVisibility.HIDDEN:
                this.hide(layer);
                break;
        }
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
    }
}
