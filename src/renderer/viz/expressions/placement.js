import BaseExpression from './base';
import { checkType, implicitCast, checkMaxArguments } from './utils';

/**
 * Placement. Define an image offset relative to its size. Where:
 * - `symbolPlacement: placement(1,1)` means to align the bottom left corner of the image with the point center.
 * - `symbolPlacement: placement(0,0)` means to align the center of the image with the point center.
 * - `symbolPlacement: placement(-1,-1)` means to align the top right corner of the image with the point center.
 *
 * ```
 *           |1
 *           |
 *           |
 * -1 -------+------- 1
 *           |
 *           |
 *         -1|
 * ```
 *
 * You can also use `align_center` and `align_bottom` to set the simbol placement as follows:
 * - `symbolPlacement: align_bottom` is equivalent to `symbolPlacement: placement(0, 1)`
 * - `symbolPlacement: align_center` is equivalent to `symbolPlacement: placement(0, 0)`
 *
 * @param {number} x - first numeric expression that indicates the image offset in the X direction.
 * @param {number} y - second numeric expression that indicates the image offset in the Y direction.
 * @return {Placement} Numeric expression
 *
 * @example <caption>Setting the aligment to the top corner of the image.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   symbol: s.image('./marker.svg').
 *   symbolPlacement: s.placement(1, 0)
 * });
 *
 * @example <caption>Setting the aligment to the top corner of the image. (String)</caption>
 * const viz = new carto.Viz(`
 *   symbol: image('./marker.svg')
 *   symbolPlacement: placement(1, 0)
 * `);
 *
 * @memberof carto.expressions
 * @name placement
 * @function
 * @api
 */

export default class Placement extends BaseExpression {
    constructor (x, y) {
        checkMaxArguments(arguments, 2, 'placement');

        x = implicitCast(x);
        y = implicitCast(y);
        super({ x, y });
        this.inlineMaker = inline => `vec2(${inline.x}, ${inline.y})`;
        this.type = 'placement';
    }
    eval (v) {
        return [this.x.eval(v), this.y.eval(v)];
    }
    _bindMetadata (meta) {
        super._bindMetadata(meta);
        checkType('placement', 'x', 0, 'number', this.x);
        checkType('placement', 'y', 1, 'number', this.y);
    }
}
