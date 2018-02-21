import * as R from '../../core/renderer';

let integrator = null;
export default function getCartoMapIntegrator(map) {
    if (!integrator) {
        integrator = new CartoMapIntegrator(map);
    }
    return integrator;
}

class CartoMapIntegrator {
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
