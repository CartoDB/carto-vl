import BaseExpression from './base';
import { checkString } from './utils';

/**
 * Loads a variable aliased expresion by the name
 *
 * @param {string} name - The variable name that is going to be evaluated
 * @return {carto.expressions.Base}
 *
 * @example <caption></caption
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *     sum_price: s.clusterSum(s.prop('price'))
 *   }
 *  filter: s.neq(s.var('sum_price'), 'london'),
 * });
 *
 * @example <caption>(String)</caption
 * const viz = new carto.Viz(`
 *   @sum_price: clusterSum($price)
 *   filter: @sum_price != 'london'
 * `);
 *
 * @memberof carto.expressions
 * @name var
 * @function
 * @api
 */
export default class Variable extends BaseExpression {
    constructor(name) {
        checkString('name', 'name', 0, name);
        if (name == '') {
            throw new Error('variable(): invalid parameter, zero-length string');
        }
        super({});
        this.name = name;
    }
    eval(feature) {
        return this.alias.eval(feature);
    }
    _resolveAliases(aliases) {
        if (aliases[this.name]) {
            this.childrenNames.push('alias');
            this.alias = aliases[this.name];
        } else {
            throw new Error(`variable() name '${this.name}' doesn't exist`);
        }
    }
    _compile(meta) {
        this.alias._compile(meta);
        this.type = this.alias.type;
    }
    _applyToShaderSource(getGLSLforProperty) {
        return this.alias._applyToShaderSource(getGLSLforProperty);
    }
    _getDependencies() {
        return [this.alias];
    }
    _getMinimumNeededSchema() {
        return this.alias._getMinimumNeededSchema();
    }
}
