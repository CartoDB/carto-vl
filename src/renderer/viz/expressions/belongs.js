import { implicitCast, checkType, checkExpression, checkMaxArguments } from './utils';
import BaseExpression from './base';

/**
 * Check if a categorical value belongs to a list of categories.
 *
 * @param {Category|Number} input - Categorical or numeric expression to be tested against the whitelist
 * @param {Category[]|Number[]} list - Multiple expression parameters that will form the whitelist
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
 * @example <caption>Display only products where $amount is 10, 15 or 20.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.in(s.prop('amount'), [10, 15, 20])
 * });
 *
 * @example <caption>Display only products where $amount is 10, 15 or 20. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: $amount in [10, 15, 20]
 * `);
 *
 * @memberof carto.expressions
 * @name in
 * @function
 * @api
 */
export const In = generateBelongsExpression('in', (input, list) => list.some(item => item === input) ? 1 : 0);

const belongsReturn = {
    nin: {
        check: '1.',
        result: '0.'
    },
    in: {
        check: '0.',
        result: '1.'
    }
};

/**
 * Check if value does not belong to the list of elements.
 *
 * @param {Category|Number} input - Categorical or numeric expression to be tested against the blacklist
 * @param {Category[]|Number[]} list - Multiple expression parameters that will form the blacklist
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
 * @example <caption>Display only products where $amount is not 10, 15 or 20.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.nin(s.prop('amount'), [10, 15, 20])
 * });
 *
 * @example <caption>Display only products where $amount is not 10, 15 or 20. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: $amount nin [10, 15, 20]
 * `);
 *
 * @memberof carto.expressions
 * @name nin
 * @function
 * @api
 */
export const Nin = generateBelongsExpression('nin', (input, list) => list.some(item => item === input) ? 0 : 1);

function generateBelongsExpression (name, jsEval) {
    return class BelongExpression extends BaseExpression {
        constructor (input, list) {
            checkMaxArguments(arguments, 2, name);

            input = implicitCast(input);
            list = implicitCast(list);

            checkExpression(name, 'input', 0, input);
            checkExpression(name, ['list', 'variable'], 1, list);

            super({ input, list });

            this.type = 'number';
            this.name = name;
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
            const checkValue = belongsReturn[this.name].check;

            const preface = `float ${funcName}(float x){
                ${funcBody}

                return ${checkValue};
            }`;

            return {
                preface: this._prefaceCode(childSources.input.preface + childSources.list.preface + preface),
                inline: `${funcName}(${childSources.input.inline})`
            };
        }

        _getFuncList () {
            const returnValue = belongsReturn[this.name].result;

            return (elem) => {
                const x = this.input.type === 'number' ? `${elem}.0` : `cat${elem._uid}`;
                return `if (x==${x}) { return ${returnValue}; }`;
            };
        }

        _bindMetadata (meta) {
            super._bindMetadata(meta);
            const validTypes = ['number', 'category'];

            validTypes.forEach((type) => {
                if (this.input.type === type) {
                    checkType(name, 'input', 0, type, this.input);
                    checkType(name, 'list', 1, `${type}-list`, this.list);
                }
            });
        }
    };
}
