import BaseExpression from './base';
import { implicitCast, getOrdinalFromIndex, checkMaxArguments, checkType } from './utils';

/**
 * Given a property create "sub-groups" based on the given breakpoints.
 *
 * This returns a number or category expression depending on the input values.
 *
 * @param {Number|Category} property - The property to be evaluated and interpolated
 * @param {Number[]|Category[]} breakpoints - Expression containing the different breakpoints.
 * @return {Number|Category}
 *
 * @example <caption>Display a traffic dataset in 4 colors depending on the numeric speed.</caption>
 * // Using the buckets `expression` we divide the dataset into 4 buckets according to the speed
 * // - From -inf to 29
 * // - From 30 to 79
 * // - From 80 to 119
 * // - From 120 to +inf
 * // Values lower than 0 will be in the first bucket and values higher than 120 will be in the last one.
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *    color: s.ramp(
 *      s.buckets(s.prop('speed'), [30, 80, 120]),
 *      s.palettes.PRISM
 *    )
 * });
 *
 * @example <caption>Display a traffic dataset in 4 colors depending on the numeric speed. (String)</caption>
 * // Using the buckets `expression` we divide the dataset into 4 buckets according to the speed
 * // - From -inf to 29
 * // - From 30 to 79
 * // - From 80 to 119
 * // - From 120 to +inf
 * // Values lower than 0 will be in the first bucket and values higher than 120 will be in the last one.
 * const viz = new carto.Viz(`
 *    color: ramp(buckets($speed, [30, 80, 120]), PRISM)
 * `);
 *
 * @example <caption>Display a traffic dataset is 3 colors depending on the category procesedSpeed.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(
 *     s.buckets(s.prop('procesedSpeed'), ['slow', 'medium', 'high']),
 *     s.palettes.PRISM)
 *   )
 * });
 *
 * @example <caption>Display a traffic dataset is 3 colors depending on the category procesedSpeed. (String)</caption>
 * const viz = new carto.Viz(`
 *    color: ramp(buckets($procesedSpeed, ['slow', 'medium', 'high']), PRISM)
 * `);
 *
 * @memberof carto.expressions
 * @name buckets
 * @function
 * @api
 */
export default class Buckets extends BaseExpression {
    constructor (input, list) {
        checkMaxArguments(arguments, 2, 'buckets');

        input = implicitCast(input);
        list = implicitCast(list);

        let looseType;

        if (input.type) {
            if (input.type !== 'number' && input.type !== 'category') {
                throw new Error(`buckets(): invalid first parameter type\n\t'input' type was ${input.type}`);
            }
            looseType = input.type;
        }

        checkType('buckets', 'list', 1, ['number-array', 'category-array'], list);

        list.elems.map((item, index) => {
            if (item.type) {
                if (looseType && looseType !== item.type) {
                    throw new Error(`buckets(): invalid ${getOrdinalFromIndex(index + 1)} parameter type` +
                        `\n\texpected type was ${looseType}\n\tactual type was ${item.type}`);
                } else if (item.type !== 'number' && item.type !== 'category') {
                    throw new Error(`buckets(): invalid ${getOrdinalFromIndex(index + 1)} parameter type\n\ttype was ${item.type}`);
                }
            }
        });

        let children = {
            input
        };

        list.elems.map((item, index) => {
            children[`arg${index}`] = item;
        });
        super(children);
        this.numCategories = list.elems.length + 1;
        this.list = list;
        this.type = 'category';
    }

    eval (feature) {
        const v = this.input.eval(feature);
        let i = 0;

        if (this.input.type === 'category') {
            for (i = 0; i < this.list.elems.length; i++) {
                if (v === this.list.elems[i].eval(feature)) {
                    return i;
                }
            }
        }

        if (this.input.type === 'number') {
            for (i = 0; i < this.list.elems.length; i++) {
                if (v < this.list.elems[i].eval(feature)) {
                    return i;
                }
            }
        }

        return i;
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);

        if (this.input.type !== 'number' && this.input.type !== 'category') {
            throw new Error(`buckets(): invalid first parameter type\n\t'input' type was ${this.input.type}`);
        }

        this.list.elems.map((item, index) => {
            if (this.input.type !== item.type) {
                throw new Error(`buckets(): invalid ${getOrdinalFromIndex(index + 1)} parameter type` +
                    `\n\texpected type was ${this.input.type}\n\tactual type was ${item.type}`);
            } else if (item.type !== 'number' && item.type !== 'category') {
                throw new Error(`buckets(): invalid ${getOrdinalFromIndex(index + 1)} parameter type\n\ttype was ${item.type}`);
            }
        });
    }

    _applyToShaderSource (getGLSLforProperty) {
        const childSources = this.childrenNames.map(name => this[name]._applyToShaderSource(getGLSLforProperty));
        let childInlines = {};
        childSources.map((source, index) => {
            childInlines[this.childrenNames[index]] = source.inline;
        });
        const funcName = `buckets${this._uid}`;
        const cmp = this.input.type === 'category' ? '==' : '<';
        const elif = (_, index) =>
            `${index > 0 ? 'else' : ''} if (x${cmp}(${childInlines[`arg${index}`]})){
                return ${index}.;
            }`;
        const funcBody = this.list.elems.map(elif).join('');
        const preface = `float ${funcName}(float x){
            ${funcBody}
            return ${this.numCategories - 1}.;
        }`;

        return {
            preface: this._prefaceCode(childSources.map(s => s.preface).reduce((a, b) => a + b, '') + preface),
            inline: `${funcName}(${childInlines.input})`
        };
    }
}
