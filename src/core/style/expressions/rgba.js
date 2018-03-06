import Expression from './expression';
import { float } from '../functions';

//TODO refactor to uniformcolor, write color (plain, literal)

/**
 * 
 * Evaluates to a rgba color.
 * 
 * @param {carto.style.expressions.float | number} r - The amount of red in the color
 * @param {carto.style.expressions.float | number} g - The amount of red in the color
 * @param {carto.style.expressions.float | number} b - The amount of red in the color
 * @param {carto.style.expressions.float | number} a - The alpha value of the color
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
        var color = [r, g, b, a];
        color = color.map(x => Number.isFinite(x) ? float(x) : x);
        r = color[0];
        g = color[1];
        b = color[2];
        a = color[3];
        super({ r, g, b, a });
    }
    _compile(meta) {
        super._compile(meta);
        if (this.r.type != 'float' || this.g.type != 'float' || this.b.type != 'float' || this.a.type != 'float') {
            throw new Error('Invalid parameters for RGBA()');
        }
        this.type = 'color'; // TODO this kind of thing can be refactored into Color class and use: extends ColorExpression
        this.inlineMaker = inline => `vec4(${inline.r}, ${inline.g}, ${inline.b}, ${inline.a})`;
    }
    // TODO eval
}
