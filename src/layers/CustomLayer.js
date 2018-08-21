import Renderer from '../renderer/Renderer';

export default class CustomLayer {
    constructor (id) {
        this.id = id;
        this.type = 'custom';

        this.map = null;
        this.gl = null;

        this.renderer = new Renderer();
    }

    render (gl, matrix) {
    }

    render3D (gl, matrix) {
    }

    onAdd (map, gl) {
        this.map = map;
        this.gl = gl;
        this.renderer._initGL(gl);
        this._setCenter();
        this._setZoom();
        this.initialize();
    }

    onRemove (map) {
    }

    initialize () {
        throw Error('Not implemented');
    }
}
