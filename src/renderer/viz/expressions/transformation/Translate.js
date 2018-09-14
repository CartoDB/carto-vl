import BaseExpression from '../base';
import { checkType, implicitCast, checkMaxArguments } from '../utils';

/**
 * Translate. Define a translation:
 *
 * @param {number} x - first numeric expression that indicates the translation in the X direction.
 * @param {number} y - second numeric expression that indicates the translation in the Y direction.
 * @return {Translate} Numeric expression
 *
 * @example <caption>Apply an x, y translation</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   transform: s.translate(10, 20)
 * });
 *
 * @example <caption>Apply an x, y translation. (String)</caption>
 * const viz = new carto.Viz(`
 *   transform: translate(10, 20)
 * `);
 *
 * @memberof carto.expressions
 * @name translate
 * @function
 * @api
 */

export default class Translate extends BaseExpression {
    constructor (x, y) {
        checkMaxArguments(arguments, 2, 'translate');

        x = implicitCast(x);
        y = implicitCast(y);
        super({ x, y });
        this.inlineMaker = inline => `vec2(${inline.x}, ${inline.y})`;
        this.type = 'translation';
    }

    eval (value) {
        return [this.x.eval(value), this.y.eval(value)];
    }

    _bindMetadata (meta) {
        super._bindMetadata(meta);
        checkType('translate', 'x', 0, 'number', this.x);
        checkType('translate', 'y', 1, 'number', this.y);
    }
}
