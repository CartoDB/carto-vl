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
        this.renderer._initGL(this.map._gl);
        this.invalidateWebGLState = () => {};
    }

    addLayer(layerId, layer) {
        this.map.addLayer(layerId, layer);
    }
    needRefresh(){
    }
}
