import SAT from './collision';

export default class Geometry {
    /**
     * @constructor
     * @param {Number} [x = 0] The starting X coordinate
     * @param {Number} [y = 0] The starting Y coordinate
     */
    constructor(x = 0, y = 0) {
        /**
         * @desc The X coordinate of the body
         * @type {Number}
         */
        this.x = x;

        /**
         * @desc The Y coordinate of the body
         * @type {Number}
         */
        this.y = y;
    }

    /**
     * Determines if the body is colliding with another body
     * @param {Circle|Polygon|Point} target The target body to test against
     * @param {Result} [result = null] A Result object on which to store information about the collision
     * @param {Boolean} [aabb = true] Set to false to skip the AABB test (useful if you use your own potential collision heuristic)
     * @returns {Boolean}
     */
    collides(target, aabb = true) {
        return SAT(this, target, aabb);
    }
}
