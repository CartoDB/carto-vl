import BaseExpression from '../base';
import { checkString } from '../utils';

/**
 * Evaluates the value of a column for every row in the dataset.
 *
 * For example think about a dataset containing 3 cities: Barcelona, Paris and London.
 * The `prop('name')` will return the name of the current city for every point in the dataset.
 *
 * @param {string} name - The property in the dataset that is going to be evaluated
 * @return {Number|Category|Date}
 *
 * @example <caption>Display only cities with name different from "London".</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *  filter: s.neq(s.prop('name'), 'london')
 * });
 *
 * @example <caption>Display only cities with name different from "London". (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: neq(prop('name'), 'london')
 * `);
 *
 * const viz = new carto.Viz(`
 *   filter: $name != 'london'
 * `);
 *
 * @memberof carto.expressions
 * @name prop
 * @function
 * @api
 */
export default class Property extends BaseExpression {
    constructor(name) {
        checkString('property', 'name', 0, name);
        if (name == '') {
            throw new Error('property(): invalid parameter, zero-length string');
        }
        super({});
        this.name = name;
    }
    _isFeatureDependent(){
        return true;
    }
    get value() {
        return this.eval();
    }
    eval(feature) {
        if (!feature) {
            throw new Error('A property needs to be evaluated in a feature');
        }
        return feature[this.name];
    }
    _compile(meta) {
        const metaColumn = meta.columns.find(c => c.name == this.name);
        if (!metaColumn) {
            throw new Error(`Property '${this.name}' does not exist`);
        }
        this.type = metaColumn.type;
        if (this.type == 'category') {
            this.numCategories = metaColumn.categoryNames.length;
        }
        super._setGenericGLSL((childInlines, getGLSLforProperty) => getGLSLforProperty(this.name));
    }
    _applyToShaderSource(getGLSLforProperty) {
        return {
            preface: '',
            inline: getGLSLforProperty(this.name)
        };
    }
    _getMinimumNeededSchema() {
        return {
            columns: [
                this.name
            ]
        };
    }
}
