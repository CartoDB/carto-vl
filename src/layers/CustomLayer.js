import Renderer from '../renderer/Renderer';

// There is one renderer per map, so the layers added to the same map
// use the same renderer with each renderLayer

// const renderers = new WeakMap();
// export default function getRenderer (map) {
//     if (!renderers.get(map)) {
//         renderers.set(map, new Renderer(map));
//     }
//     return renderers.get(map);
// }

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
        this.renderer.initialize(map, gl);
        this.initialize();
    }

    onRemove (map) {
        this.map = null;
        this.gl = null;
    }

    initialize () {
        throw Error('Not implemented');
    }
}
