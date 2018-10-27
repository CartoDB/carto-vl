
import BaseExpression from './base';

// A VariantExpression is a base class to define expressions
// whose form is decided only after the variables have been resolved.
// A derived class must provide a constructor, passing the children to super
// and a  `_choose` method returning an expression to which all
// properties will be forwarded, or null if any expression type
// needed for the choice isn't yet available.
export default class VariantExpression extends BaseExpression {
    constructor (children) { // TODO: remove args
        super(children);
        // Resolve the expression at construction time if possible
        this._proxy = this._choose();
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
                if (obj._proxy) {
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
            this._proxy = this._choose();
            if (this._proxy) {
                this._proxy._bindMetadata(metadata);
            }
        }
    }

    _resolveAliases (aliases) {
        super._resolveAliases(aliases);
        if (!this._proxy) {
            this._proxy = this._choose();
            if (this._proxy) {
                this._proxy._resolveAliases(aliases);
            }
        }
    }
}
