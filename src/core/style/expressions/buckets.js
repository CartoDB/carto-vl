import Expression from './expression';
import { implicitCast, getOrdinalFromIndex } from './utils';

let bucketUID = 0;

export default class Buckets extends Expression {

    /**
     * Given a property create "sub-groups" based on the given breakpoints.
     * 
     * 
     * Imagine a traffic dataset with a speed property. We want to divide the roads in
     * 3 buckets (slow, medium, fast) based on the speed using a different color each bucket.
     * 
     * 
     * We´ll need:
     *  - A {@link carto.style.expressions.ramp|ramp } to add a color for every bucket.
     *  - A {@link carto.style.expressions.palettes|colorPalette } to define de color scheme.
     * 
     * 
     * ```javascript
     *  const s = carto.style.expressions;
     *  const $speed = s.prop('speed');
     *  const style = new carto.Style({
     *  color: s.ramp(
     *      s.buckets($speed, 30, 80, 120),
     *      s.palettes.PRISM),
     * });
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
     *  const s = carto.style.expressions;
     *  const $procesedSpeed = s.prop('procesedSpeed');
     *  const style = new carto.Style({
     *  color: s.ramp(
     *      s.buckets($procesedSpeed, 'slow', 'medium', 'high'),
     *      s.palettes.PRISM),
     * });
     * ```
     * 
     * @param {carto.style.expressions.property} property - The property to be evaluated and interpolated
     * @param {...carto.style.expressions.expression} breakpoints - Numeric expression containing the different breakpoints.
     * @return {carto.style.expressions.expression} 
     * 
     * @memberof carto.style.expressions
     * @name buckets
     * @function
     * @api
     */
    constructor(input, ...args) {
        input = implicitCast(input);
        args = args.map(implicitCast);

        let looseType = undefined;
        if (input.type) {
            if (input.type != 'float' && input.type != 'category') {
                throw new Error(`buckets(): invalid first parameter type\n\t'input' type was ${input.type}`);
            }
            looseType = input.type;
        }
        args.map((arg, index) => {
            if (arg.type) {
                if (looseType && looseType != arg.type) {
                    throw new Error(`buckets(): invalid ${getOrdinalFromIndex(index)} parameter type` +
                        `\n\texpected type was ${looseType}\n\tactual type was ${arg.type}`);
                } else if (arg.type != 'float' && arg.type != 'category') {
                    throw new Error(`buckets(): invalid ${getOrdinalFromIndex(index)} parameter type\n\ttype was ${arg.type}`);
                }
            }
        });

        let children = {
            input
        };
        args.map((arg, index) => children[`arg${index}`] = arg);
        super(children);
        this.bucketUID = bucketUID++;
        this.numCategories = args.length + 1;
        this.args = args;
        this.type = 'category';
    }
    _compile(metadata) {
        super._compile(metadata);
        this.othersBucket = this.input.type == 'category';

        const input = this.input;
        if (input.type != 'float' && input.type != 'category') {
            throw new Error(`buckets(): invalid first parameter type\n\t'input' type was ${input.type}`);
        }
        this.args.map((arg, index) => {
            if (input.type != arg.type) {
                throw new Error(`buckets(): invalid ${getOrdinalFromIndex(index)} parameter type` +
                    `\n\texpected type was ${input.type}\n\tactual type was ${arg.type}`);
            } else if (arg.type != 'float' && arg.type != 'category') {
                throw new Error(`buckets(): invalid ${getOrdinalFromIndex(index)} parameter type\n\ttype was ${arg.type}`);
            }
        });
    }
    _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
        const childSources = this.childrenNames.map(name => this[name]._applyToShaderSource(uniformIDMaker, propertyTIDMaker));
        let childInlines = {};
        childSources.map((source, index) => childInlines[this.childrenNames[index]] = source.inline);
        const funcName = `buckets${this.bucketUID}`;
        const cmp = this.input.type == 'category' ? '==' : '<';
        const elif = (_, index) =>
            `${index > 0 ? 'else' : ''} if (x${cmp}(${childInlines[`arg${index}`]})){
                return ${index}.;
            }`;
        const funcBody = this.args.map(elif).join('');
        const preface = `float ${funcName}(float x){
            ${funcBody}
            return ${this.numCategories - 1}.;
        }`;

        return {
            preface: childSources.map(s => s.preface).reduce((a, b) => a + b, '') + preface,
            inline: `${funcName}(${childInlines.input})`
        };
    }
    eval(feature) {
        const v = this.input.eval(feature);
        let i;
        for (i = 0; i < this.args.length; i++) {
            if (this.input.type == 'category' && v == this.args[i].eval(feature)) {
                return i;
            } else if (this.input.type == 'float' && v < this.args[i].eval(feature)) {
                return i;
            }
        }
        return i;
    }
}
