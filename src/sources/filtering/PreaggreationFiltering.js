import { And, Or, Equals, NotEquals, LessThan, LessThanOrEqualTo, GreaterThan, GreaterThanOrEqualTo } from '../renderer/viz/expressions/binary';
import { In, Nin } from '../renderer/viz/expressions/belongs';
import Between from '../renderer/viz/expressions/between';
import Property from '../renderer/viz/expressions/basic/property';
import Blend from '../renderer/viz/expressions/blend';
import Transition from '../renderer/viz/expressions/transition';
import NumberExpression from '../renderer/viz/expressions/basic/number';
import ConstantExpression from '../renderer/viz/expressions/basic/constant';
import CategoryExpression from '../renderer/viz/expressions/basic/category';

export default class PreaggregationFiltering {
    /**
     * Generate pre-aggregation filters, i.e. filters that can be
     * applied to the dataset before aggregation.
     * This extracts, from the vizs filters, those compatible to be
     * executed before aggregation.
     * The extracted filters are in an internal tree-like format;
     * each node has a `type` property and various other parameters
     * that depend on the type.
     */

    // return (partial) filters as an object (JSON) representing the SQL syntax tree
    getFilter (vizFilter) {
        return this._filter(vizFilter);
    }

    _filter (f) {
        return this._and(f) || this._or(f) ||
            this._in(f) || this._notIn(f) ||
            this._between(f) ||
            this._equals(f) || this._notEquals(f) ||
            this._lessThan(f) || this._lessThanOrEqualTo(f) ||
            this._greaterThan(f) || this._greaterThanOrEqualTo(f) ||
            this._blend(f) || null;
    }

    _and (f) {
        if (f.isA(And)) {
            // we can ignore nonsupported (null) subexpressions that are combined with AND
            // and keep the supported ones as a partial filter
            const l = [this._filter(f.a), this._filter(f.b)].filter(Boolean).reduce((x, y) => x.concat(y), []);
            if (l.length) {
                if (l.length === 1) {
                    return l[0];
                }
                return {
                    type: 'and',
                    left: l[0],
                    right: l[1]
                };
            }
        }
    }

    _or (f) {
        if (f.isA(Or)) {
            // if any subexpression is not supported the OR combination isn't supported either
            let a = this._filter(f.a);
            let b = this._filter(f.b);
            if (a && b) {
                return {
                    type: 'or',
                    left: a,
                    right: b
                };
            }
        }
    }

    _lessThan (f) {
        return this._cmpOp(f, LessThan, 'lessThan');
    }

    _lessThanOrEqualTo (f) {
        return this._cmpOp(f, LessThanOrEqualTo, 'lessThanOrEqualTo');
    }

    _greaterThan (f) {
        return this._cmpOp(f, GreaterThan, 'greaterThan');
    }

    _greaterThanOrEqualTo (f) {
        return this._cmpOp(f, GreaterThanOrEqualTo, 'greaterThanOrEqualTo');
    }

    _equals (f) {
        return this._cmpOp(f, Equals, 'equals');
    }

    _notEquals (f) {
        return this._cmpOp(f, NotEquals, 'notEquals');
    }

    _cmpOp (f, opClass, type) {
        if (f.isA(opClass)) {
            let a = this._property(f.a) || this._value(f.a);
            let b = this._property(f.b) || this._value(f.b);
            if (a && b) {
                return {
                    type: type,
                    left: a,
                    right: b
                };
            }
        }
    }

    _blend (f) {
        if (f.isA(Blend) && f.originalMix.isA(Transition)) {
            return this._filter(f.b);
        }
    }

    _property (f) {
        if (f.isA(Property)) {
            return {
                type: 'property',
                property: f.name
            };
        }
    }

    _value (f) {
        if (f.isA(NumberExpression) || f.isA(ConstantExpression) || f.isA(CategoryExpression)) {
            return {
                type: 'value',
                value: f.expr
            };
        }
    }

    _in (f) {
        if (f.isA(In)) {
            let p = this._property(f.value);
            let values = f.list.elems.map(cat => this._value(cat));
            if (p && values.length > 0 && values.length === f.list.elems.length) {
                return {
                    type: 'in',
                    property: p.property,
                    values: values.map(v => v.value)
                };
            }
        }
    }

    _notIn (f) {
        if (f.isA(Nin)) {
            let p = this._property(f.value);
            let values = f.list.elems.map(cat => this._value(cat));
            if (p && values.length > 0 && values.length === f.list.elems.length) {
                return {
                    type: 'notIn',
                    property: p.property,
                    values: values.map(v => v.value)
                };
            }
        }
    }

    _between (f) {
        if (f.isA(Between)) {
            let p = this._property(f.value);
            let lo = this._value(f.lowerLimit);
            let hi = this._value(f.upperLimit);
            if (p && lo && hi) {
                return {
                    type: 'between',
                    property: p.property,
                    lower: lo.value,
                    upper: hi.value
                };
            }
        }
    }
}
