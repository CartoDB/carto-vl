import BaseExpression from './base';
import { checkLooseType, checkType, implicitCast } from './utils';

/**
 * Placement. Define a sprite offset relative to its size. Where:
 * -`placement(1,1)` means to align the bottom left corner of the sprite with the point center.
 * -`placement(0,0)` means to align the center of the sprite with the point center.
 * -`placement(-1,-1)` means to align the top right corner of the sprite with the point center.
 *
 *           |1
 *           |
 *           |
 * -1 -------+------- 1
 *           |
 *           |
 *         -1|
 *
 * @param {number} x - first numeric expression that indicates the sprite offset in the X direction.
 * @param {number} y - second numeric expression that indicates the sprite offset in the Y direction.
 * @return {Placement} Numeric expression
 *
 * @example <caption>Setting the aligment to the top corner of the sprite.</caption>
 *   symbol: sprite('./marker.svg')
 *   symbolPlacement: placement(1, 0)
 *
 * @memberof carto.expressions
 * @name placement
 * @function
 * @api
 */
export default class Placement extends BaseExpression {
    constructor(x, y) {
        x = implicitCast(x);
        y = implicitCast(y);
        checkLooseType('placement', 'x', 0, 'number', x);
        checkLooseType('placement', 'y', 1, 'number', y);
        super({ x, y });
        this.inlineMaker = inline => `vec2(${inline.x}, ${inline.y})`;
        this.type = 'placement';
    }
    eval(v) {
        return [this.x.eval(v), this.y.eval(v)];
    }
    _compile(meta) {
        super._compile(meta);
        checkType('placement', 'x', 0, 'number', this.x);
        checkType('placement', 'y', 1, 'number', this.y);
    }
}
