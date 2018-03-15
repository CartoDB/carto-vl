import Expression from './expression';
import { float } from '../functions';
import { implicitCast, checkLooseType, checkType } from './utils';

//TODO refactor to uniformcolor, write color (plain, literal)

/**
 *
 * Evaluates to a rgba color.
 *
 * @param {carto.style.expressions.number|number} r - The amount of red in the color
 * @param {carto.style.expressions.number|number} g - The amount of red in the color
 * @param {carto.style.expressions.number|number} b - The amount of red in the color
 * @param {carto.style.expressions.number|number} a - The alpha value of the color
 * @return {carto.style.expressions.rgba}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.style.expressions;
 * const $type = s.property('type');
 * const style = new carto.Style({
 *  color: s.rgba(0, 1, 0, 1);
 * });
 *
 * @memberof carto.style.expressions
 * @name rgba
 * @function
 * @api
 */
export default class RGBA extends Expression {
    /**
     * @description RGBA color constructor
     * @param {*} r red component in the [0,1] range
     * @param {*} g green component in the [0,1] range
     * @param {*} b blue component in the [0,1] range
     * @param {*} a alpha/opacity component in the [0,1] range
     */
    constructor(r, g, b, a) {
        [r, g, b, a] = [r, g, b, a].map(implicitCast);
        checkLooseType('rgba', 'r', 0, 'float', r);
        checkLooseType('rgba', 'g', 1, 'float', g);
        checkLooseType('rgba', 'b', 2, 'float', b);
        checkLooseType('rgba', 'a', 3, 'float', a);
        super({ r, g, b, a });
        this.type = 'color';
    }
    _compile(meta) {
        super._compile(meta);
        checkType('rgba', 'r', 0, 'float', this.r);
        checkType('rgba', 'g', 1, 'float', this.g);
        checkType('rgba', 'b', 2, 'float', this.b);
        checkType('rgba', 'a', 3, 'float', this.a);
        this.inlineMaker = inline => `vec4(${inline.r}, ${inline.g}, ${inline.b}, ${inline.a})`;
    }
    // TODO eval
}
