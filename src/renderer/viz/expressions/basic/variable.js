import BaseExpression from '../base';
import { checkString } from '../utils';

/**
 * Alias to a named variable defined in the Viz.
 *
 * @param {string} name - The variable name that is going to be evaluated
 * @return {Number|Category|Color|Date}
 *
 * @example <caption></caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *     sum_price: s.clusterSum(s.prop('price'))
 *   }
 *  filter: s.neq(s.var('sum_price'), 'london'),
 * });
 *
 * @example <caption>(String)</caption>
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
export class Variable extends BaseExpression {
    constructor () {
        super({});
    }
}
function isFunction (functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}
export default function variable (name) {
    checkString('variable', 'name', 0, name);
    if (name == '') {
        throw new Error('variable(): invalid parameter, zero-length string');
    }
    let alias;
    const resolve = aliases => {
        if (aliases[name]) {
            alias = aliases[name];
        } else {
            throw new Error(`variable() name '${name}' doesn't exist`);
        }
    };
    const _getDependencies = () => {
        return [alias];
    };
    let aliaser = {
        set: (obj, prop, value) => {
            if (prop == 'parent') {
                obj[prop] = value;
            } else if (prop == 'notify') {
                obj[prop] = value;
            } else if (alias && alias[prop]) {
                alias[prop] = value;
            } else {
                return false;
            }
            // Indicate success
            return true;
        },
        get: (obj, prop) => {
            if (prop == 'parent') {
                return obj[prop];
            } else if (prop == '_resolveAliases') {
                return resolve;
            } else if (prop == '_getDependencies') {
                return _getDependencies;
            } else if (prop == 'notify') {
                return obj[prop];
            } else if (prop == 'blendTo') {
                return obj[prop];
            }
            if (alias && alias[prop]) {
                if (isFunction(alias[prop])) {
                    return alias[prop].bind(alias);
                }
                return alias[prop];
            }
            return obj[prop];
        }
    };
    const proxy = new Proxy(new Variable(), aliaser);
    return proxy;
}
