import Expression from './expression';
import { checkString } from './utils';

export default class Variable extends Expression {
    /**
     * @jsapi
     * @param {*} name Property/column name
     */
    constructor(name) {
        checkString('name', 'name', 0, name);
        if (name == '') {
            throw new Error('variable(): invalid parameter, zero-length string');
        }
        super({});
        this.name = name;
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
    eval(feature) {
        return this.alias.eval(feature);
    }
}
