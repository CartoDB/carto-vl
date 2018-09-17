import BaseExpression from '../base';
import { checkType, implicitCast, checkMaxArguments } from '../utils';

/**
 * Rotate. Define a rotation in degrees.
 *
 * Limitation: only supported in combination with `symbol:`.
 *
 * @param {Number} angle - angle to rotate in degrees in clockwise direction
 * @return {Transform}
 *
 * @example <caption>Rotate 30 degrees in clockwise direction.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   symbol: s.CROSS
 *   transform: s.rotate(30)
 * });
 *
 * @example <caption>Rotate 30 degrees in clockwise direction. (String)</caption>
 * const viz = new carto.Viz(`
 *   symbol: cross
 *   transform: rotate(30)
 * `);
 *
 * @example <caption>Rotate 30 degrees in counter-clockwise direction.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   symbol: s.CROSS
 *   transform: s.rotate(-30)
 * });
 *
 * @example <caption>Rotate 30 degrees in counter-clockwise direction. (String)</caption>
 * const viz = new carto.Viz(`
 *   symbol: cross
 *   transform: rotate(-30)
 * `);
 *
 * @memberof carto.expressions
 * @name rotate
 * @function
 * @api
 */

export default class Rotate extends BaseExpression {
    constructor (angle) {
        checkMaxArguments(arguments, 1, 'rotate');

        angle = implicitCast(angle);
        super({ angle });
        this.type = 'transformation';
    }

    _applyToShaderSource (getGLSLforProperty) {
        const angle = this.angle._applyToShaderSource(getGLSLforProperty);
        return {
            preface: this._prefaceCode(`
                ${angle.preface}

                #ifndef DEGREES_TO_RADIANS
                #define DEGREES_TO_RADIANS
                float degreesToRadians(float degrees){
                    return degrees/360.*2.*3.14159265359;
                }
                #endif
                
                vec2 rotate${this._uid}(vec2 p){
                    float angle = degreesToRadians(${angle.inline});
                    mat2 M = mat2(cos(angle), -sin(angle),
                                  sin(angle),  cos(angle));
                    return M * p;
                }`),

            inline: `rotate${this._uid}`
        };
    }

    eval (feature) {
        // TODO
        return [0, 0];
    }

    _bindMetadata (meta) {
        super._bindMetadata(meta);
        checkType('rotate', 'angle', 0, 'number', this.angle);
    }
}
