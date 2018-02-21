import * as _ from 'lodash';


export default class Map {

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

        this._paintCallbacks = {};
        this._canvas = this._createCanvas();
        this._container.appendChild(this._canvas);
        this._gl = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl');

        // Repaint: true
        setInterval(() => {
            this.update();
        }, 10);
    }

    addLayer(layerId, paintCallback) {
        this._paintCallbacks[layerId] = paintCallback;
    }

    update() {
        const { width, height } = this._containerDimensions();
        this._resizeCanvas(width, height);

        // Draw background
        this._gl.clearColor(0.5, 0.5, 0.5, 1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT);

        _.forOwn(this._paintCallbacks, function(callback) {
            if (callback) {
                callback();
            }
        });
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

    _resizeCanvas(width, height) {
        const pixelRatio = window.devicePixelRatio || 1;

        this._canvas.width = pixelRatio * width;
        this._canvas.height = pixelRatio * height;

        this._canvas.style.width = `${width}px`;
        this._canvas.style.height = `${height}px`;
    }
}
