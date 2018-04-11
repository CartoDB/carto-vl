import Expression from './expression';
import { checkString } from './utils';

/**
 *
 * Evaluates the value of a column for every row in the dataset.
 *
 * For example think about a dataset containing 3 cities: Barcelona, Paris and London.
 * The `prop('name')` will return the name of the current city for every point in the dataset.
 *
 * @param {string} name - The property in the dataset that is going to be evaluated
 * @return {carto.style.expressions.property}
 *
 * @example <caption>Display only cities with name different from "London"</caption>
 * const s = carto.style.expressions;
 * const style = new carto.Style({
 *  filter: s.neq(s.prop('name'), 'london'),
 * });
 *
 * @memberof carto.style.expressions
 * @name prop
 * @function
 * @api
 */
export default class Property extends Expression {
    /**
     * @jsapi
     * @param {*} name Property/column name
     */
    constructor(name) {
        checkString('property', 'name', 0, name);
        if (name == '') {
            throw new Error('property(): invalid parameter, zero-length string');
        }
        super({});
        this.name = name;
    }
    _resolveAliases(aliases) {
        if (aliases[this.name]) {
            this.childrenNames.push('alias');
            this.alias = aliases[this.name];
        } else {
            this.alias = null;
        }
    }
    _compile(meta) {
        if (this.alias) {
            this.alias._compile(meta);
            this.type = this.alias.type;
            return;
        }
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
        if (this.alias) {
            return this.alias._applyToShaderSource(getGLSLforProperty);
        }
        return {
            preface: '',
            inline: getGLSLforProperty(this.name)
        };
    }
    _getDependencies() {
        if (this.alias){
            return [this.alias];
        }else{
            return [];
        }
    }
    _getMinimumNeededSchema() {
        if (this.alias) {
            return this.alias._getMinimumNeededSchema();
        }
        return {
            columns: [
                this.name
            ]
        };
    }
    eval(feature) {
        if (this.alias) {
            return this.alias.eval(feature);
        }
        return feature[this.name];
    }
}
