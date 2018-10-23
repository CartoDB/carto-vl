
import BaseExpression from './base';

// A VariantExpression is a base class to define expressions
// whose form is decided only after the variables have been resolved.
// A derived class must provide a `_choose` method with the
// constructor arguments and returning an expression to which all
// properties will be forwarded.
export default class VariantExpression extends BaseExpression {
    constructor (...args) {
        super({});
        this._args = args;
        this._proxy = null;
        const ownProperties = [
            '_resolveAliases', '_args', '_proxy', '_choose'
        ];
        const aliaser = {
            set: (obj, prop, value) => {
                if (prop === '_proxy') {
                    this._proxy = value;
                } else if (this._proxy) {
                    this._proxy[prop] = value;
                } else {
                    obj[prop] = value;
                }
                return true;
            },
            get: (obj, prop) => {
                if (ownProperties.includes(prop)) {
                    return obj[prop];
                } else if (this._proxy) {
                    return this._proxy[prop];
                } else {
                    return obj[prop];
                }
            }
        };
        return new Proxy(this, aliaser);
    }

    _resolveAliases (aliases) {
        super._resolveAliases(aliases);
        this._args.forEach(arg => {
            if (arg instanceof BaseExpression) {
                arg._resolveAliases(aliases);
            }
        });
        this._proxy = this._choose(...this._args);
        this._proxy._resolveAliases(aliases);
    }
}
