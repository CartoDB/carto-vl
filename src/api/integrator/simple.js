import * as R from '../../core/renderer';

let integrator = null;
export default function getSMIntegrator(map) {
    if (!integrator) {
        integrator = new SimpleMapIntegrator(map);
    }
    return integrator;
}

class SimpleMapIntegrator {
    constructor(map) {
        this.map = map;
        this.renderer = new R.Renderer();
        this.invalidateWebGLState = () => {};
    }

    addLayer(layerId, moveCallback, paintCallback) {
        moveCallback();
        this.renderer._initGL(this.map._gl);
        this.map.addLayer(paintCallback);
    }
}
