import BaseExpression from './base';
import { checkInstance, checkMaxArguments } from './utils';

/**
 * Order ascending by a provided expression. NOTE: only works with `width()`.
 *
 * @param {carto.expressions.Width} by - must be `width()`
 * @return {Order}
 *
 * @example <caption>Ascending order based on width.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   order: s.asc(s.width())
 * });
 *
 * @example <caption>Ascending order based on width. (String)</caption>
 * const viz = new carto.Viz(`
 *   order: asc(width())
 * `);
 *
 * @memberof carto.expressions
 * @name asc
 * @function
 * @IGNOREapi
 */
export class Asc extends BaseExpression {
    constructor (by) {
        checkMaxArguments(arguments, 1, 'asc');

        super({});
        checkInstance('asc', 'by', 0, Width, by);
        this.type = 'orderer';
    }
}

/**
 * Order descending by a provided expression. NOTE: only works with `width()`.
 *
 * @param {carto.expressions.Width} by - must be `width()`
 * @return {Order}
 *
 * @example <caption>Descending order based on width.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   order: s.desc(s.width())
 * });
 *
 * @example <caption>Descending order based on width. (String)</caption>
 * const viz = new carto.Viz(`
 *   order: desc(width())
 * `);
 *
 * @memberof carto.expressions
 * @name desc
 * @function
 * @IGNOREapi
 */
export class Desc extends BaseExpression {
    constructor (by) {
        checkMaxArguments(arguments, 1, 'desc');

        super({});
        checkInstance('desc', 'by', 0, Width, by);
        this.type = 'orderer';
    }
}

/**
 * No order expression.
 *
 * @return {Order}
 *
 * @example <caption>No order.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   order: s.noOrder()
 * });
 *
 * @example <caption>No order. (String)</caption>
 * const viz = new carto.Viz(`
 *   order: noOrder()
 * `);
 *
 * @memberof carto.expressions
 * @name noOrder
 * @function
 * @IGNOREapi
 */
export class NoOrder extends BaseExpression {
    constructor () {
        checkMaxArguments(arguments, 0, 'noOrder');

        super({});
        this.type = 'orderer';
    }
}

/**
 * Return the expression assigned in the `width` property. ONLY usable in an `order:` property.
 *
 * @return {carto.expressions.Width}
 *
 * @example <caption>Ascending order based on width.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   order: s.asc(s.width())
 * });
 *
 * @example <caption>Ascending order based on width. (String)</caption>
 * const viz = new carto.Viz(`
 *   order: asc(width())
 * `);
 *
 * @memberof carto.expressions
 * @name width
 * @function
 * @IGNOREapi
 */
export class Width extends BaseExpression {
    constructor () {
        checkMaxArguments(arguments, 1, 'width');

        super({});
        this.type = 'propertyReference';
    }
}
