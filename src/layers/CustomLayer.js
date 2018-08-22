import Renderer from '../renderer/Renderer';

// There is one renderer per map, so the layers added to the same map
// use the same renderer with each renderLayer
const renderers = new WeakMap();

function getRenderer (map, gl) {
    if (!renderers.get(map)) {
        const renderer = new Renderer();
        renderer.initialize(map, gl);
        renderers.set(map, renderer);
    }
    return renderers.get(map);
}

export default class CustomLayer {
    constructor (id) {
        this.id = id;
        this.type = 'custom';

        this.gl = null;
        this.map = null;
        this.renderer = null;
    }

    render (gl, matrix) {
    }

    render3D (gl, matrix) {
    }

    onAdd (map, gl) {
        this.gl = gl;
        this.map = map;
        this.renderer = getRenderer(map, gl);
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
