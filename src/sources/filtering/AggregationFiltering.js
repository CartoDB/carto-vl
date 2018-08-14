import { And, Or, Equals, NotEquals, LessThan, LessThanOrEqualTo, GreaterThan, GreaterThanOrEqualTo } from '../renderer/viz/expressions/binary';
import { In, Nin } from '../renderer/viz/expressions/belongs';
import Between from '../renderer/viz/expressions/between';
import Property from '../renderer/viz/expressions/basic/property';
import Blend from '../renderer/viz/expressions/blend';
import Transition from '../renderer/viz/expressions/transition';
import NumberExpression from '../renderer/viz/expressions/basic/number';
import ConstantExpression from '../renderer/viz/expressions/basic/constant';
import CategoryExpression from '../renderer/viz/expressions/basic/category';
import ClusterAvg from '../renderer/viz/expressions/aggregation/cluster/ClusterAvg';
import ClusterMax from '../renderer/viz/expressions/aggregation/cluster/ClusterMax';
import ClusterMin from '../renderer/viz/expressions/aggregation/cluster/ClusterMin';
import ClusterMode from '../renderer/viz/expressions/aggregation/cluster/ClusterMode';
import ClusterSum from '../renderer/viz/expressions/aggregation/cluster/ClusterSum';

import * as schema from '../renderer/schema';

export default class AggregationFiltering {
    /**
     * Generate aggregation filters:
     * This extracts, from the vizs filters, those compatible to be
     * executed through the Maps API aggregation API.
     * The extracted filters are in the format admitted by the Maps API
     * `filters` parameter.
     * Filters affecting dimensions (non-aggregated columns) can optionally
     * be extracted too, but it is more efficient to not do so and apply those
     * filters before aggregation.
     */
    constructor (options) {
        // exclusive mode: aggregate filters don't include pre-aggregate conditions (dimensions)
        // in that case pre-aggregate filters should always be applied, even with aggregation
        // (which can be more efficient)
        this._onlyAggregateFilters = options.exclusive;
    }

    // return (partial) filters as an object (JSON) in the format of the Maps API aggregation interface
    getFilters (vizFilter) {
        let filters = {};
        let filterList = this._and(vizFilter).filter(Boolean);
        for (let p of filterList) {
            let name = p.property;
            let existingFilter = filters[name];
            if (existingFilter) {
                if (this._compatibleAndFilters(existingFilter, p.filters)) {
                    // combine inequalities into a range
                    Object.assign(existingFilter[0], p.filters[0]);
                } else {
                    // can't AND-combine filters for the same property
                    return {};
                }
            } else {
                filters[name] = p.filters;
            }
        }
        return filters;
    }

    _and (f) {
        if (f.isA(And)) {
            return this._and(f.a).concat(this._and(f.b)).filter(Boolean);
        }
        return [this._or(f)].filter(Boolean);
    }

    _or (f) {
        if (f.isA(Or)) {
            let a = this._basicCondition(f.a);
            let b = this._basicCondition(f.b);
            if (a && b) {
                if (a.property === b.property) {
                    a.filters = a.filters.concat(b.filters);
                    return a;
                }
            }
        }
        return this._basicCondition(f);
    }

    _removeBlend (f) {
        if (f.isA(Blend) && f.originalMix.isA(Transition)) {
            return f.b;
        }
        return f;
    }

    _basicCondition (f) {
        f = this._removeBlend(f);
        return this._between(f) ||
            this._equals(f) || this._notEquals(f) ||
            this._lessThan(f) || this._lessThanOrEqualTo(f) ||
            this._greaterThan(f) || this._greaterThanOrEqualTo(f) ||
            this._in(f) || this._notIn(f);
    }

    _value (f) {
        f = this._removeBlend(f);
        if (f.isA(NumberExpression) || f.isA(ConstantExpression) || f.isA(CategoryExpression)) {
            return f.expr;
        }
    }

    _between (f) {
        if (f.isA(Between)) {
            let p = this._aggregation(f.value);
            let lo = p && this._value(f.lowerLimit);
            let hi = p && lo && this._value(f.upperLimit);
            if (hi) {
                p.filters.push({
                    greater_than_or_equal_to: lo,
                    less_than_or_equal_to: hi
                });
                return p;
            }
        }
    }

    _in (f) {
        if (f.isA(In)) {
            let p = this._aggregation(f.value);
            let values = f.list.elems.map(c => this._value(c)).filter(v => v !== null);
            if (p && values.length > 0 && values.length === f.list.elems.length) {
                p.filters.push({
                    in: values
                });
                return p;
            }
        }
    }

    _notIn (f) {
        if (f.isA(Nin)) {
            let p = this._aggregation(f.value);
            let values = f.list.elems.map(c => this._value(c)).filter(v => v !== null);
            if (p && values.length > 0 && values.length === f.list.elems.length) {
                p.filters.push({
                    not_in: values
                });
                return p;
            }
        }
    }

    _equals (f) {
        return this._cmpOp(f, Equals, 'equal');
    }

    _notEquals (f) {
        return this._cmpOp(f, NotEquals, 'not_equal');
    }

    _lessThan (f) {
        return this._cmpOp(f, LessThan, 'less_than', 'greater_than');
    }

    _lessThanOrEqualTo (f) {
        return this._cmpOp(f, LessThanOrEqualTo, 'less_than_or_equal_to', 'greater_than_or_equal_to');
    }

    _greaterThan (f) {
        return this._cmpOp(f, GreaterThan, 'greater_than', 'less_than');
    }

    _greaterThanOrEqualTo (f) {
        return this._cmpOp(f, GreaterThanOrEqualTo, 'greater_than_or_equal_to', 'less_than_or_equal_to');
    }

    _aggregation (f) {
        f = this._removeBlend(f);
        if (f.isA(ClusterAvg) || f.isA(ClusterMax) || f.isA(ClusterMin) || f.isA(ClusterMode) || f.isA(ClusterSum)) {
            let p = this._property(f.property);
            if (p) {
                p.property = schema.column.aggColumn(p.property, f.aggName);
                return p;
            }
        }
        if (this._onlyAggregateFilters) {
            // no filters on non-aggregate columns (i.e. dimensions) are generated
            // such filtering should be applied elsewhere
            return;
        }
        return this._property(f);
    }

    _property (f) {
        f = this._removeBlend(f);
        if (f.isA(Property)) {
            return {
                property: f.name,
                filters: []
            };
        }
    }

    _cmpOp (f, opClass, opParam, inverseOpParam) {
        inverseOpParam = inverseOpParam || opParam;
        if (f.isA(opClass)) {
            let p = this._aggregation(f.a);
            let v = p && this._value(f.b);
            let op = opParam;
            if (!v) {
                p = this._aggregation(f.b);
                v = p && this._value(f.a);
                op = inverseOpParam;
            }
            if (v) {
                let filter = {};
                filter[op] = v;
                p.filters.push(filter);
                return p;
            }
        }
    }

    _compatibleAndFilters (a, b) {
        // check if a and b can be combined into a range filter
        if (a.length === 0 || b.length === 0) {
            return true;
        }
        if (a.length === 1 && b.length === 1) {
            const af = a[0];
            const bf = b[0];
            if (Object.keys(af).length === 1 && Object.keys(bf).length === 1) {
                const ka = Object.keys(af)[0];
                const kb = Object.keys(bf)[0];
                const lessOps = ['less_than', 'less_than_or_equal_to'];
                const greaterOps = ['greater_than', 'greater_than_or_equal_to'];
                return (lessOps.includes(ka) && greaterOps.includes(kb)) ||
                    (lessOps.includes(kb) && greaterOps.includes(ka));
            }
        }
        return false;
    }
}
