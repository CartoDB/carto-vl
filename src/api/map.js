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
    constructor(options) {
        options = options || {};

        if (typeof options.container === 'string') {
            const container = window.document.getElementById(options.container);
            if (!container) {
                throw new Error(`Container '${options.container}' not found.`);
            } else {
                this._container = container;
            }
        }

        this._layers = [];
        this._repaint = true;
        this._canvas = this._createCanvas();
        this._container.appendChild(this._canvas);
        this._gl = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl');

        this._resizeCanvas(this._containerDimensions());
    }

    addLayer(layer) {
        layer.getData();
        this._layers.push(layer);
        window.requestAnimationFrame(this.update.bind(this));
    }

    update() {
        // Draw background
        this._gl.clearColor(0.5, 0.5, 0.5, 1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT);

        let loaded = true;
        this._layers.forEach((layer) => {
            const hasData = layer.hasDataframes();
            if (hasData) {
                layer.paintCallback();
            }
            loaded = loaded && hasData;
        });

        // Update until all layers are loaded
        if (!loaded) {
            window.requestAnimationFrame(this.update.bind(this));
        }
    }

    _createCanvas() {
        const canvas = window.document.createElement('canvas');

        canvas.className = 'canvas';
        canvas.style.position = 'absolute';

        return canvas;
    }

    _containerDimensions() {
        let width = 0;
        let height = 0;

        if (this._container) {
            width = this._container.offsetWidth || 400;
            height = this._container.offsetHeight || 300;
        }

        return { width, height };
    }

    _resizeCanvas(size) {
        const pixelRatio = window.devicePixelRatio || 1;

        this._canvas.width = pixelRatio * size.width;
        this._canvas.height = pixelRatio * size.height;

        this._canvas.style.width = `${size.width}px`;
        this._canvas.style.height = `${size.height}px`;
    }
}
