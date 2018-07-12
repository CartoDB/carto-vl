import SAT from './collision';

/**
 * Base Geometry to detect collisions
 * https://github.com/Prozi/detect-collisions/
 */
export default class Geometry {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Determines if the geometry is colliding with another geometry
     */
    collides(geometry) {
        return SAT(this, geometry);
    }
}
