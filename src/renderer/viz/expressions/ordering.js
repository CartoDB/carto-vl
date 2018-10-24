import BaseExpression from './base';
import { checkInstance, checkMaxArguments, implicitCast, checkExpression } from './utils';

/**
 * Order ascending by a provided expression. NOTE: only works with `width()`.
 *
 * Note: ordering expressions won't assure a perfect ordering.
 * Features will be distributed in different buckets with the original order, and those buckets will be ordered.
 * This guarantees a maximum error, but not a perfect order.
 * For most operations this is imperceptible, but usage of `order` in combination with animation or multi-scale expressions (`zoomrange` and `scaled`)
 * may result in artifacts.
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
 * @api
 */
export class Asc extends BaseExpression {
    constructor (by) {
        checkMaxArguments(arguments, 1, 'asc');
        by = implicitCast(by);
        checkExpression('asc', 'by', 0, by);
        super({ by });
        this.type = 'orderer';
    }
    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkInstance('asc', 'by', 0, Width, this.by);
    }
}

/**
 * Order descending by a provided expression. NOTE: only works with `width()`.
 *
 * Note: ordering expressions won't assure a perfect ordering.
 * Features will be distributed in different buckets with the original order, and those buckets will be ordered.
 * This guarantees a maximum error, but not a perfect order.
 * For most operations this is imperceptible, but usage of `order` in combination with animation or multi-scale expressions (`zoomrange` and `scaled`)
 * may result in artifacts.
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
 * @api
 */
export class Desc extends BaseExpression {
    constructor (by) {
        checkMaxArguments(arguments, 1, 'desc');
        by = implicitCast(by);
        checkExpression('desc', 'by', 0, by);
        super({ by });
        this.type = 'orderer';
    }
    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkInstance('desc', 'by', 0, Width, this.by);
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
 * @api
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
 * Note: ordering expressions won't assure a perfect ordering.
 * Features will be distributed in different buckets with the original order, and those buckets will be ordered.
 * This guarantees a maximum error, but not a perfect order.
 * For most operations this is imperceptible, but usage of `order` in combination with animation or multi-scale expressions (`zoomrange` and `scaled`)
 * may result in artifacts.
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
 * @api
 */
export class Width extends BaseExpression {
    constructor () {
        checkMaxArguments(arguments, 1, 'width');

        super({});
        this.type = 'propertyReference';
    }
}
