import { implicitCast, checkType, checkExpression, checkMaxArguments } from './utils';
import BaseExpression from './base';
import { isNumber } from 'util';

/**
 * Check if a categorical value belongs to a list of categories.
 *
 * @param {Category} input - Categorical expression to be tested against the whitelist
 * @param {Category[]} list - Multiple expression parameters that will form the whitelist
 * @return {Number} Numeric expression with the result of the check
 *
 * @example <caption>Display only cities where $type is 'metropolis' or 'capital'.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.in(s.prop('type'), ['metropolis', 'capital'])
 * });
 *
 * @example <caption>Display only cities where $type is 'metropolis' or 'capital'. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: $type in ['metropolis', 'capital']
 * `);
 *
 * @memberof carto.expressions
 * @name in
 * @function
 * @api
 */
export const In = generateBelongsExpression('in', IN_INLINE_MAKER, (input, list) => list.some(item => item === input) ? 1 : 0);

const OPERATORS = {
    nin: '!=',
    in: '=='
}

function IN_INLINE_MAKER(list) {
    if (!list || list.length === 0) {
        return () => '0.';
    }
    return inline => `((${list.map((cat, index) => `(${inline.input} == ${inline.list[index]})`).join(' || ')})? 1.: 0.)`;
}

/**
 * Check if value does not belong to the list of elements.
 *
 * @param {Category} input - Categorical expression to be tested against the blacklist
 * @param {Category[]} list - Multiple expression parameters that will form the blacklist
 * @return {Number} Numeric expression with the result of the check
 *
 * @example <caption>Display only cities where $type is not 'metropolis' or 'capital'.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.nin(s.prop('type'), ['metropolis', 'capital'])
 * });
 *
 * @example <caption>Display only cities where $type is not 'metropolis' or 'capital'. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: $type nin ['metropolis', 'capital']
 * `);
 *
 * @memberof carto.expressions
 * @name nin
 * @function
 * @api
 */
export const Nin = generateBelongsExpression('nin', NIN_INLINE_MAKER, (input, list) => list.some(item => item === input) ? 0 : 1);

function NIN_INLINE_MAKER (list) {
    if (list.length === 0) {
        return () => '1.';
    }
    return inline => `((${list.map((cat, index) => `(${inline.input} != ${inline.list[index]})`).join(' && ')})? 1.: 0.)`;
}

function generateBelongsExpression (name, inlineMaker, jsEval) {
    return class BelongExpression extends BaseExpression {
        constructor (input, list) {
            checkMaxArguments(arguments, 2, name);

            input = implicitCast(input);
            list = implicitCast(list);

            checkExpression(name, 'input', 0, input);
            checkExpression(name, ['list', 'variable'], 1, list);

            super({ input, list });

            this.type = 'number';
            this.compare = OPERATORS[name];
        }

        get value () {
            return jsEval(this.input.value, this.list.value);
        }

        eval (feature) {
            return jsEval(this.input.eval(feature), this.list.eval(feature));
        }

        _applyToShaderSource (getGLSLforProperty) {
            const childSourcesArray = this.childrenNames.map(name => this[name]._applyToShaderSource(getGLSLforProperty));

            let childSources = {};
            childSourcesArray.map((source, index) => {
                childSources[this.childrenNames[index]] = source;
            });

            const funcName = `belongs${this._uid}`;
            const funcList = this._getFuncList();
            const funcBody = this.list.elems.map(funcList).join('');
            const preface = `float ${funcName}(float x){
                ${funcBody}

                return 0.;
            }`;

            return {
                preface: this._prefaceCode(childSources.input.preface + childSources.list.preface + preface),
                inline: `${funcName}(${childSources.input.inline})`
            };
        }

        _getFuncList () {
            return (elem) => {
                const x = isNumber(elem) ? `${elem}.0` : `cat${elem._uid}`;
                return `if (x${this.compare}${x}) { return 1.; }`;
            }
        }

        _bindMetadata (meta) {
            super._bindMetadata(meta);
            const validTypes = ['number', 'category', 'date'];

            validTypes.forEach((type) => {
                if (this.input.type === type) {
                    checkType(name, 'input', 0, type, this.input);
                    checkType(name, 'list', 1, `${type}-list`, this.list);
                }
            });
        }
    };
}
