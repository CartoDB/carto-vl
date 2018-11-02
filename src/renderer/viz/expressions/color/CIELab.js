import BaseExpression from '../base';
import { implicitCast, checkType, checkExpression, checkMaxArguments } from '../utils';
import CIELabGLSL from './CIELab.glsl';

/**
 * Evaluates to a CIELab color.
 *
 * @param {Number} l - The lightness of the color
 * @param {Number} a - The green–red color component
 * @param {Number} b - The blue–yellow color component
 * @return {Color}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.cielab(32.3, 79.2, -107.86)
 * });
 *
 * @example <caption>Display blue points. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: cielab(32.3, 79.2, -107.86)
 * `);
 *
 * @memberof carto.expressions
 * @name cielab
 * @function
 * @api
 */
export default class CIELab extends BaseExpression {
    constructor (l, a, b) {
        checkMaxArguments(arguments, 3, 'cielab');
        l = implicitCast(l);
        a = implicitCast(a);
        b = implicitCast(b);

        checkExpression('cielab', 'l', 0, l);
        checkExpression('cielab', 'a', 1, a);
        checkExpression('cielab', 'b', 2, b);

        super({ l, a, b });
        this.type = 'color';

        this._setGenericGLSL(
            inline => `cielabToSRGBA(vec4(${inline.l}, ${inline.a}, ${inline.b}, 1.))`,
            CIELabGLSL
        );
    }
    // TODO EVAL

    _bindMetadata (meta) {
        super._bindMetadata(meta);
        checkType('cielab', 'l', 0, 'number', this.l);
        checkType('cielab', 'a', 1, 'number', this.a);
        checkType('cielab', 'b', 2, 'number', this.b);
    }
}
