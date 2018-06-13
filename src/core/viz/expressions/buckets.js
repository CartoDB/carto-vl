import BaseExpression from './base';
import { implicitCast, getOrdinalFromIndex } from './utils';

/**
 * Given a property create "sub-groups" based on the given breakpoints.
 *
 * Imagine a traffic dataset with a speed property. We want to divide the roads in
 * 3 buckets (slow, medium, fast) based on the speed using a different color each bucket.
 *
 * We´ll need:
 *  - A {@link carto.expressions.ramp|ramp} to add a color for every bucket.
 *  - A {@link carto.expressions.palettes|colorPalette} to define de color scheme.
 *
 * ```javascript
 *  const s = carto.expressions;
 *  const $speed = s.prop('speed');
 *  const viz = new carto.Viz({
 *    color: s.ramp(
 *      s.buckets($speed, [30, 80, 120]),
 *      s.palettes.PRISM
 *    )
 * });
 * ```
 *
 * ```javascript
 *  const viz = new carto.Viz(`
 *    color: ramp(buckets($speed, [30, 80, 120]), PRISM)
 * `);
 * ```
 *
 * Using the buckets `expression` we divide the dataset in 3 buckets according to the speed:
 *  - From 0 to 29
 *  - From 30 to 79
 *  - From 80 to 120
 *
 * Values lower than 0 will be in the first bucket and values higher than 120 will be in the third one.
 *
 * This expression can be used for categorical properties, imagine the previous example with the data already
 * procesed in a new categorical `procesedSpeed` column:
 *
 * ```javascript
 *  const s = carto.expressions;
 *  const $procesedSpeed = s.prop('procesedSpeed');
 *  const viz = new carto.Viz({
 *    color: s.ramp(
 *      s.buckets($procesedSpeed, ['slow', 'medium', 'high']),
 *      s.palettes.PRISM)
 *    )
 * });
 * ```
 *
 * ```javascript
 *  const viz = new carto.Viz(`
 *    color: ramp(buckets($procesedSpeed, ['slow', 'medium', 'high']), PRISM)
 * `);
 * ```
 *
 * @param {Number|Category} property - The property to be evaluated and interpolated
 * @param {Number[]|Category[]} breakpoints - Numeric expression containing the different breakpoints.
 * @return {Number|Category}
 *
 * @memberof carto.expressions
 * @name buckets
 * @function
 * @api
 */
export default class Buckets extends BaseExpression {
    constructor(input, list) {
        input = implicitCast(input);
        list = implicitCast(list);

        let looseType = undefined;
        if (input.type) {
            if (input.type != 'number' && input.type != 'category') {
                throw new Error(`buckets(): invalid first parameter type\n\t'input' type was ${input.type}`);
            }
            looseType = input.type;
        }
        list.elems.map((item, index) => {
            if (item.type) {
                if (looseType && looseType != item.type) {
                    throw new Error(`buckets(): invalid ${getOrdinalFromIndex(index+1)} parameter type` +
                        `\n\texpected type was ${looseType}\n\tactual type was ${item.type}`);
                } else if (item.type != 'number' && item.type != 'category') {
                    throw new Error(`buckets(): invalid ${getOrdinalFromIndex(index+1)} parameter type\n\ttype was ${item.type}`);
                }
            }
        });

        let children = {
            input
        };
        list.elems.map((item, index) => children[`arg${index}`] = item);
        super(children);
        this.numCategories = list.elems.length + 1;
        this.list = list;
        this.type = 'category';
    }

    eval(feature) {
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

    _compile(metadata) {
        super._compile(metadata);
        this.isCategoryType = this.input.type === 'category';
        this.isBucketComplete = this.isCategoryType && this.list.elems.length === this.input.alias.numCategories;
        
        if (this.input.type != 'number' && this.input.type != 'category') {
            throw new Error(`buckets(): invalid first parameter type\n\t'input' type was ${this.input.type}`);
        }
        
        this.list.elems.map((item, index) => {
            if (this.input.type != item.type) {
                throw new Error(`buckets(): invalid ${getOrdinalFromIndex(index+1)} parameter type` +
                    `\n\texpected type was ${this.input.type}\n\tactual type was ${item.type}`);
            } else if (item.type != 'number' && item.type != 'category') {
                throw new Error(`buckets(): invalid ${getOrdinalFromIndex(index+1)} parameter type\n\ttype was ${item.type}`);
            }
        });
    }

    _applyToShaderSource(getGLSLforProperty) {
        const childSources = this.childrenNames.map(name => this[name]._applyToShaderSource(getGLSLforProperty));
        let childInlines = {};
        childSources.map((source, index) => childInlines[this.childrenNames[index]] = source.inline);
        const funcName = `buckets${this._uid}`;
        const cmp = this.input.type == 'category' ? '==' : '<';
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
