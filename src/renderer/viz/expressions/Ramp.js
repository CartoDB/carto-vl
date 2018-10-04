import BaseExpression from './base';
import { implicitCast, checkExpression, checkMaxArguments } from './utils';

import RampImage from './RampImage';
import RampGeneric from './RampGeneric';
import { DEFAULT_RAMP_OTHERS } from './constants';

/**
* Create a ramp: a mapping between an input (numeric or categorical) and an output (number, colors and/or images)
*
* When the input has the same number of categories (without taking the "others" category into account).
* Then, each input category will have a one to one match with an output value.
*
* Some case examples:
* `ramp(buckets($product, ['A, 'B', 'C']), [house, car, bus])`
* `ramp(buckets($price, [20, 50, 120]), [1, 10, 4, 12])`
* `ramp(top($product, 3), [blue, yellow, green])`
* `ramp(globalQuantiles($price, 3), [red, yellow, green])`
*
* When the input has different number of categories or the input is a linear expression.
* Then it will interpolate the output values (Note: this is not supported if output values are images)
*
* Some case examples:
* `ramp(linear($price, 1, 10) [green, yellow, red])`
* `ramp(buckets($product, ['A, 'B', 'C'], [red, blue]))
* - When the input is a categorical property, we wrap it automatically in a CategoryIndex expression
* `ramp($product, Prism)` (equivalent to `ramp($categoryIndex($product)), Prism)`
* - When the input is a numeric property, we wrap it automatically in a Linear expression.
* `ramp($price, Prism)` (equivalent to `ramp($linear($price)), Prism)`
*
* The "others" value is setted by default, depending on the output type:
* - If it is "Number", the "others" value is 1.
* - If it is "Color" from a color array (i.e: [red, yellow, green]), the "others" value is the gray color.
* - If it is "Color" from a cartocolor palette (i.e: Prism), the "others" value is the last color of the palette.
* - If it is "Image", the "others" value is a circle.
*
* If we add a third parameter, the "others" default value will be overridden by this one
*
* @param {Number|Category} input - The input expression to give a color
* @param {Palette|Color[]|Number[]} palette - The color palette that is going to be used
* @param {Number|Color|Image} [others] - Value that overrides the default value for "others"
* @return {Number|Color|Image}
*
* @example <caption>Mapping categories to numbers, colors and images.</caption>
* const s = carto.expressions;
* const viz = new carto.Viz({
*   width: s.ramp(s.buckets(s.prop('product'), ['A, 'B', 'C']), [1, 2, 3])
*   color: s.ramp(s.buckets(s.prop('product'), ['A, 'B', 'C']), s.palettes.PRISM)
*   strokeColor: s.ramp(s.buckets(s.prop('product'), ['A, 'B', 'C']), [s.namedColor('red'), s.namedColor('yellow'), s.namedColor('green')])
*   symbol: s.ramp(s.buckets(s.prop('product'), ['A, 'B', 'C']), [s.HOUSE, s.CAR, s.BUS])
* });
*
* @example <caption>Mapping categories to numbers, colors and images. (String)</caption>
* const viz = new carto.Viz(`
*   width: ramp(buckets($product), ['A, 'B', 'C']), [1, 2, 3])
*   color: ramp(buckets($product), ['A, 'B', 'C']), Prism)
*   strokeColor: ramp(buckets($product), ['A, 'B', 'C']), [red, yellow, green])
*   symbol: ramp(buckets($product), ['A, 'B', 'C']), [house, car, bus])
* `);
*
* @example <caption>Mapping classified numeric properties to numbers, colors and images.</caption>
* const s = carto.expressions;
* const viz = new carto.Viz({
*   width: s.ramp(s.buckets(s.prop('price'), [40, 100]), [1, 2, 3])
*   color: s.ramp(s.buckets(s.prop('price'), [40, 100]), s.palettes.PRISM)
*   strokeColor: s.ramp(s.buckets(s.prop('price'), [40, 100]), [s.namedColor('red'), s.namedColor('yellow'), s.namedColor(green)])
*   symbol: s.ramp(s.buckets(s.prop('price'), [40, 100]), [s.HOUSE), s.CAR, s.BUS])
* });
*
* @example <caption>Mapping classified numeric properties to numbers, colors and images. (String)</caption>
* const viz = new carto.Viz(`
*   width: ramp(buckets($price, [40, 100]), [1, 2, 3])
*   color: ramp(buckets($price, [40, 100]), Prism)
*   strokeColor: ramp(buckets($price, [40, 100]), [red, yellow, green])
*   symbol: ramp(buckets($price, [40, 100]), [house, car, bus])
* `);
*
* @example <caption>Override default values.</caption>
* const s = carto.expressions;
* const viz = new carto.Viz({
*   width: s.ramp(s.top(s.prop('price'), 3), [1, 2, 3], 0)
*   strokeColor: s.ramp(s.top(s.prop('price'), 3), Prism, s.namedColor('red'))
*   color: s.ramp(s.top(s.prop('price'), 3), [s.namedColor('blue'), s.namedColor('red'), s.namedColor('yellow')], s.namedColor(black))
*   symbol: s.ramp(s.top(s.prop('price'), 3), [s.HOUSE, s.CAR, s.BUS], s.CROSS)
* });
*
* @example <caption>Override default values. (String)</caption>
* const viz = new carto.Viz(`
*   width: ramp(top($price, 3), [1, 2, 3], 0)
*   strokeColor: ramp(top($price, 3), Prism, red)
*   color: ramp(top($price, 3), [blue, red, yellow], black)
*   symbol: ramp(top($price, 3), [house, car, bus], cross)
* `);
*
* @memberof carto.expressions
* @name ramp
* @function
* @api
*/

/**
 * Ramp Class
 *
 * A mapping between an input (numeric or categorical) and an output (number, colors and/or images)
 * This class is instanced automatically by using the `ramp` function. It is documented for its methods.
 * Read more about ramp expression at {@link carto.expressions.ramp}.
 *
 * @name expressions.Ramp
 * @abstract
 * @hideconstructor
 * @class
 * @api
 */
export default class Ramp extends BaseExpression {
    constructor (input, palette, others = DEFAULT_RAMP_OTHERS) {
        checkMaxArguments(arguments, 3, 'ramp');

        input = implicitCast(input);
        palette = implicitCast(palette);

        checkExpression('ramp', 'input', 0, input);
        checkExpression('ramp', 'palette', 1, palette);

        if (others !== DEFAULT_RAMP_OTHERS) {
            others = implicitCast(others);
            checkExpression('ramp', 'others', 2, others);
        }

        super({ input, palette });
        this.palette = palette;
        this.others = others;
        this._defaultOthers = others === DEFAULT_RAMP_OTHERS;
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        switch (this.palette.type) {
            case 'image-list':
                Object.setPrototypeOf(this, RampImage.prototype);
                break;
            default:
                Object.setPrototypeOf(this, RampGeneric.prototype);
                break;
        }

        return this._bindMetadata(metadata);
    }

    /**
     * Get a legend for the ramp.
     *
     * Note: This method works only for feature property independent outputs.
     * Example:
     * - This works: `ramp($price, [5, 15])`
     * - This does not work: `ramp($price, [5, $amount])`
     *
     * @param {Object} config - Optional configuration
     * @param {String} config.othersLabel - Name for other category values. Defaults to 'CARTO_VL_OTHERS'.
     * @param {Number} config.samples - Number of samples for numeric values to be returned. Defaults to 10. The maximum number of samples is 100.
     * @return {Object} - `{ type, data }`. 'type' could be category or number. Data is an array of { key, value } objects. 'key' depends on the expression type. 'value' is the result evaluated by the ramp. There is more information in the examples.
     * @api
     * @example <caption>Get legend for a color ramp of a categorical property.</caption>
     * const s = carto.expressions;
     * const viz = new carto.Viz({
     *   color: s.ramp(s.prop('vehicles'), s.palettes.PRISM)
     * });
     *
     * layer.on('loaded', () => {
     *   const legend = layer.viz.color.getLegendData();
     *   // legend = {
     *   //    type: 'category',
     *   //    name: '$vehicles',
     *   //    data: [
     *   //       { key: 'Bicycle', value: { r: 95, g: 70, b: 144, a: 1 } },
     *   //       { key: 'Car', value: { r: 29, g: 105, b: 150, a: 1 } },
     *   //       { key: 'Bus', value: { r: 56, g: 166, b: 165, a: 1 } },
     *   //       { key: 'CARTO_VL_OTHERS', value: { r: 15, g: 133, b: 84, a: 1 } }
     *   //     ]
     *   // }
     * });
     *
     * @example <caption>Get legend for a color ramp of a categorical property. (String)</caption>
     * const viz = new carto.Viz(`
     *   color: ramp($vehicles, PRISM)
     * ´);
     *
     * layer.on('loaded', () => {
     *   const legend = layer.viz.color.getLegendData();
     *   // legend = {
     *   //    type: 'category',
     *   //    name: '$vehicles',
     *   //    data: [
     *   //       { key: 'Bicycle', value: { r: 95, g: 70, b: 144, a: 1 } },
     *   //       { key: 'Car', value: { r: 29, g: 105, b: 150, a: 1 } },
     *   //       { key: 'Bus', value: { r: 56, g: 166, b: 165, a: 1 } },
     *   //       { key: 'CARTO_VL_OTHERS', value: { r: 15, g: 133, b: 84, a: 1 } }
     *   //     ]
     *   // }
     * });
     *
     * @example <caption>Get legend for an image ramp of a categorical property.</caption>
     * const s = carto.expressions;
     * const viz = new carto.Viz({
     *   symbol: s.ramp(s.prop('vehicles'), [s.BICYCLE, s.CAR, s.BUS])
     * });
     *
     * layer.on('loaded', () => {
     *   const legend = layer.viz.symbol.getLegendData();
     *   // legend = {
     *   //    type: 'category',
     *   //    name: '$vehicles',
     *   //    data: [
     *   //       { key: 'Bicycle', value: bicycleImageUrl },
     *   //       { key: 'Car', value: carImageUrl },
     *   //       { key: 'Bus', value: busImageUrl },
     *   //       { key: 'CARTO_VL_OTHERS', value: circleImageUrl }
     *   //     ]
     *   // }
     * });
     *
     * @example <caption>Get legend for an image ramp of a categorical property. (String)</caption>
     * const viz = new carto.Viz(`
     *   symbol: ramp('$vehicles'), [BICYCLE, CAR, BUS])
     * `);
     *
     * layer.on('loaded', () => {
     *   const legend = layer.viz.symbol.getLegendData();
     *   // legend = {
     *   //    type: 'category',
     *   //    name: '$vehicles',
     *   //    data: [
     *   //       { key: 'Bicycle', value: bicycleImageUrl },
     *   //       { key: 'Car', value: carImageUrl },
     *   //       { key: 'Bus', value: busImageUrl },
     *   //       { key: 'CARTO_VL_OTHERS', value: circleImageUrl }
     *   //     ]
     *   // }
     * });
     *
     * @example <caption>Get legend of a ramp top expression and set "others" label.</caption>
     * const s = carto.expressions;
     * const viz = new carto.Viz({
     *   color: s.ramp(s.top(s.prop('vehicles')), s.palettes.PRISM)
     * });
     *
     * layer.on('loaded', () => {
     *   const legend = layer.viz.color.getLegendData({
     *      othersLabel: 'Other Vehicles'
     *   });
     *
     *   // legend = {
     *   //    type: 'category',
     *   //    name: 'top($vehicles)',
     *   //    data: [
     *   //       { key: 'Bicycle', value: { r: 95, g: 70, b: 144, a: 1 } },
     *   //       { key: 'Car', value: { r: 29, g: 105, b: 150, a: 1 } },
     *   //       { key: 'Bus', value: { r: 56, g: 166, b: 165, a: 1 } },
     *   //       { key: 'Other Vehicles', value: { r: 15, g: 133, b: 84, a: 1 } }
     *   //     ]
     *   // }
     * });
     *
     * @example <caption>Get legend of a ramp top expression and set "others" label. (String)</caption>
     * const viz = new carto.Viz(`
     *   color: ramp(top($vehicles, 5), PRISM)
     * `);
     *
     * layer.on('loaded', () => {
     *   const legend = layer.viz.color.getLegendData({
     *      othersLabel: 'Other Vehicles'
     *   });
     *
     *   // legend = {
     *   //    type: 'category',
     *   //    name: 'top($vehicles)',
     *   //    data: [
     *   //       { key: 'Bicycle', value: { r: 95, g: 70, b: 144, a: 1 } },
     *   //       { key: 'Car', value: { r: 29, g: 105, b: 150, a: 1 } },
     *   //       { key: 'Bus', value: { r: 56, g: 166, b: 165, a: 1 } },
     *   //       { key: 'Other Vehicles', value: { r: 15, g: 133, b: 84, a: 1 } }
     *   //     ]
     *   // }
     * });
     *
     * @example <caption>Get legend for a linear ramp expression and set number of samples.</caption>
     * const s = carto.expressions;
     * const viz = new carto.Viz({
     *   color: s.ramp(s.linear(s.prop('numvehicles'), 1, 100), s.palettes.PRISM)
     * });
     *
     * layer.on('loaded', () => {
     *   const legend = layer.viz.color.getLegendData({
     *       samples: 4
     *   });
     *
     *   // legend = {
     *   //    type: 'number',
     *   //    name: 'linear($numvehicles, 1, 100)',
     *   //    data: [
     *   //       { key: 25, value: { r: 95, g: 70, b: 144, a: 1 } },
     *   //       { key: 50, value: { r: 29, g: 105, b: 150, a: 1 } },
     *   //       { key: 75, value: { r: 56, g: 166, b: 165, a: 1 } },
     *   //       { key: 100, value: { r: 15, g: 133, b: 84, a: 1 } }
     *   //     ]
     *   // }
     * });
     *
     * @example <caption>Get legend for a linear ramp expression and set number of samples. (String)</caption>
     * const viz = new carto.Viz(`
     *   color: ramp(linear($numvehicles, 1, 100), PRISM)
     * `);
     *
     * layer.on('loaded', () => {
     *   const legend = layer.viz.color.getLegendData({
     *       samples: 4
     *   });
     *
     *   // legend = {
     *   //    type: 'number',
     *   //    name: 'linear($numvehicles, 1, 100)',
     *   //    data: [
     *   //       { key: 25, value: { r: 95, g: 70, b: 144, a: 1 } },
     *   //       { key: 50, value: { r: 29, g: 105, b: 150, a: 1 } },
     *   //       { key: 75, value: { r: 56, g: 166, b: 165, a: 1 } },
     *   //       { key: 100, value: { r: 15, g: 133, b: 84, a: 1 } }
     *   //     ]
     *   // }
     * });
     *
     * @example <caption>Get legend for a buckets ramp expression.</caption>
     * const s = carto.expressions;
     * const viz = new carto.Viz({
     *   color: s.ramp(s.buckets((s.prop('numvehicles'), [1, 2, 3]), s.palettes.PRISM))
     * });
     *
     * layer.on('loaded', () => {
     *   const legend = layer.viz.color.getLegendData();
     *
     *   // legend = {
     *   //    type: 'number',
     *   //    name: 'buckets($numvehicles, [1, 2, 3])',
     *   //    data: [
     *   //       { key: [-Infinity, 1], value: { r: 95, g: 70, b: 144, a: 1 } },
     *   //       { key: [1, 2], value: { r: 29, g: 105, b: 150, a: 1 } },
     *   //       { key: [2, 3], value: { r: 56, g: 166, b: 165, a: 1 } },
     *   //       { key: [3, +Infinity], value: { r: 15, g: 133, b: 84, a: 1 } }
     *   //     ]
     *   // }
     * });
     *
     * @example <caption>Get legend for a buckets ramp expression. (String)</caption>
     * const s = carto.expressions;
     * const viz = new carto.Viz(`
     *   color: ramp(buckets($numvehicles', [1, 2, 3]), Prism))
     * `);
     *
     * layer.on('loaded', () => {
     *   const legend = layer.viz.color.getLegendData();
     *
     *   // legend = {
     *   //    type: 'number',
     *   //    name: 'buckets($numvehicles, [1, 2, 3])',
     *   //    data: [
     *   //       { key: [-Infinity, 1], value: { r: 95, g: 70, b: 144, a: 1 } },
     *   //       { key: [1, 2], value: { r: 29, g: 105, b: 150, a: 1 } },
     *   //       { key: [2, 3], value: { r: 56, g: 166, b: 165, a: 1 } },
     *   //       { key: [3, +Infinity], value: { r: 15, g: 133, b: 84, a: 1 } }
     *   //     ]
     *   // }
     * });
     *
     * @example <caption>Get legend for a classifier ramp expression.</caption>
     * const s = carto.expressions;
     * const viz = new carto.Viz({
     *   color: s.ramp(s.globalEqIntervals(s.prop('numvehicles'), 4), s.palettes.PRISM)
     * });
     *
     * layer.on('loaded', () => {
     *   const legend = layer.viz.color.getLegendData();
     *
     *   // legend = {
     *   //    type: 'number',
     *   //    name: 'globalEqIntervals($numvehicles, 4)',
     *   //    data: [
     *   //       { key: [-Infinity, 25], value: { r: 95, g: 70, b: 144, a: 1 } },
     *   //       { key: [25, 50], value: { r: 29, g: 105, b: 150, a: 1 } },
     *   //       { key: [50, 75], value: { r: 56, g: 166, b: 165, a: 1 } },
     *   //       { key: [100, +Infinity], value: { r: 15, g: 133, b: 84, a: 1 } }
     *   //     ]
     *   // }
     * });
     *
     * @example <caption>Get legend for a classifier ramp expression. (String)</caption>
     * const s = carto.expressions;
     * const viz = new carto.Viz(`
     *   color: ramp(globalEqIntervals($numvehicles, 4), Prism)
     * `);
     *
     * layer.on('loaded', () => {
     *   const legend = layer.viz.color.getLegendData();
     *
     *   // legend = {
     *   //    type: 'number',
     *   //    name: 'globalEqIntervals($numvehicles, 4)',
     *   //    data: [
     *   //       { key: [-Infinity, 25], value: { r: 95, g: 70, b: 144, a: 1 } },
     *   //       { key: [25, 50], value: { r: 29, g: 105, b: 150, a: 1 } },
     *   //       { key: [50, 75], value: { r: 56, g: 166, b: 165, a: 1 } },
     *   //       { key: [100, +Infinity], value: { r: 15, g: 133, b: 84, a: 1 } }
     *   //     ]
     *   // }
     * });
     *
     * @memberof expressions.Ramp
     * @name getLegendData
     * @instance
     * @api
     */
}
