
import BaseExpression from './base';

// A VariantExpression is a base class to define expressions
// whose form is decided only after the variables have been resolved.
// A derived class must provide a `_choose` method with the
// constructor arguments and returning an expression to which all
// properties will be forwarded.
export default class VariantExpression extends BaseExpression {
    constructor (args, superArgs) { // TODO: remove args
        super(superArgs || {});
        this._args = args;
        // Resolve the expression at construction time if possible
        this._proxy = this._choose(...args);
        const ownProperties = [
            '_args', '_proxy', '_choose'
        ];
        const aliaser = {
            set: (obj, prop, value) => {
                // obj is this
                if (prop === '_proxy') {
                    obj._proxy = value;
                } else if (obj._proxy) {
                    obj._proxy[prop] = value;
                } else {
                    obj[prop] = value;
                }
                return true;
            },
            get: (obj, prop) => {
                // obj is this
                if (obj._proxy && !ownProperties.includes(prop)) {
                    return obj._proxy[prop];
                } else {
                    return obj[prop];
                }
            }
        };
        return new Proxy(this, aliaser);
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        if (!this._proxy) {
            this._proxy = this._choose(...this._args);
            if (this._proxy) {
                this._proxy._bindMetadata(metadata);
            }
        } else {
            this._proxy._bindMetadata(metadata);
        }
    }

    _resolveAliases (aliases) {
        super._resolveAliases(aliases);
        if (!this._proxy) {
            this._proxy = this._choose(...this._args);
            if (this._proxy) {
                this._proxy._resolveAliases(aliases);
            }
        } else {
            this._proxy._resolveAliases(aliases);
        }
    }
}
