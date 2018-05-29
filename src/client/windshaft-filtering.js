import { And, Or, Equals, NotEquals, LessThan, LessThanOrEqualTo, GreaterThan, GreaterThanOrEqualTo } from '../core/viz/expressions/binary';
import { In, Nin } from '../core/viz/expressions/belongs';
import Between from '../core/viz/expressions/between';
import Property from '../core/viz/expressions/basic/property';
import Blend from '../core/viz/expressions/blend';
import Animate from '../core/viz/expressions/animate';
import NumberExpression from '../core/viz/expressions/basic/number';
import ConstantExpression from '../core/viz/expressions/basic/constant';
import CategoryExpression from '../core/viz/expressions/basic/category';
import { ClusterAvg, ClusterMax, ClusterMin, ClusterMode, ClusterSum } from '../core/viz/expressions/aggregation/clusterAggregation';
import * as schema from '../core/schema';

class AggregationFiltering {

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
    constructor(options) {
        // exclusive mode: aggregate filters don't include pre-aggregate conditions (dimensions)
        // in that case pre-aggregate filters should always be applied, even with aggregation
        // (which can be more efficient)
        this._onlyAggregateFilters = options.exclusive;
    }

    // return (partial) filters as an object (JSON) in the format of the Maps API aggregation interface
    getFilters(vizFilter) {
        let filters = {};
        let filterList = this._and(vizFilter).filter(Boolean);
        for (let p of filterList) {
            let name = p.property;
            let existingFilter = filters[name];
            if (existingFilter) {
                if (this._compatibleAndFilters(existingFilter, p.filters)) {
                    // combine inequalities into a range
                    Object.assign(existingFilter[0], p.filters[0]);
                }
                else {
                    // can't AND-combine filters for the same property
                    return {};
                }
            }
            else {
                filters[name] = p.filters;
            }
        }
        return filters;
    }

    _and(f) {
        if (f instanceof And) {
            return this._and(f.a).concat(this._and(f.b)).filter(Boolean);
        }
        return [this._or(f)].filter(Boolean);
    }

    _or(f) {
        if (f instanceof Or) {
            let a = this._basicCondition(f.a);
            let b = this._basicCondition(f.b);
            if (a && b) {
                if (a.property == b.property) {
                    a.filters = a.filters.concat(b.filters);
                    return a;
                }
            }
        }
        return this._basicCondition(f);
    }

    _removeBlend(f) {
        if (f instanceof Blend && f.originalMix instanceof Animate) {
            return f.b;
        }
        return f;
    }

    _basicCondition(f) {
        f = this._removeBlend(f);
        return this._between(f)
            || this._equals(f) || this._notEquals(f)
            || this._lessThan(f) || this._lessThanOrEqualTo(f)
            || this._greaterThan(f) || this._greaterThanOrEqualTo(f)
            || this._in(f) || this._notIn(f);
    }

    _value(f) {
        f = this._removeBlend(f);
        if (f instanceof NumberExpression || f instanceof ConstantExpression || f instanceof CategoryExpression) {
            return f.expr;
        }
    }

    _between(f) {
        if (f instanceof Between) {
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

    _in(f) {
        if (f instanceof In) {
            let p = this._aggregation(f.value);
            let values = f.list.elems.map(c => this._value(c)).filter(v => v != null);
            if (p && values.length > 0 && values.length == f.list.elems.length) {
                p.filters.push({
                    in: values
                });
                return p;
            }
        }
    }

    _notIn(f) {
        if (f instanceof Nin) {
            let p = this._aggregation(f.value);
            let values = f.list.elems.map(c => this._value(c)).filter(v => v != null);
            if (p && values.length > 0 && values.length == f.list.elems.length) {
                p.filters.push({
                    not_in: values
                });
                return p;
            }
        }
    }

    _equals(f) {
        return this._cmpOp(f, Equals, 'equal');
    }

    _notEquals(f) {
        return this._cmpOp(f, NotEquals, 'not_equal');
    }

    _lessThan(f) {
        return this._cmpOp(f, LessThan, 'less_than', 'greater_than');
    }

    _lessThanOrEqualTo(f) {
        return this._cmpOp(f, LessThanOrEqualTo, 'less_than_or_equal_to', 'greater_than_or_equal_to');
    }

    _greaterThan(f) {
        return this._cmpOp(f, GreaterThan, 'greater_than', 'less_than');
    }

    _greaterThanOrEqualTo(f) {
        return this._cmpOp(f, GreaterThanOrEqualTo, 'greater_than_or_equal_to', 'less_than_or_equal_to');
    }

    _aggregation(f) {
        f = this._removeBlend(f);
        if (f instanceof ClusterAvg || f instanceof ClusterMax || f instanceof ClusterMin || f instanceof ClusterMode || f instanceof ClusterSum) {
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

    _property(f) {
        f = this._removeBlend(f);
        if (f instanceof Property) {
            return {
                property: f.name,
                filters: []
            };
        }
    }

    _cmpOp(f, opClass, opParam, inverseOpParam) {
        inverseOpParam = inverseOpParam || opParam;
        if (f instanceof opClass) {
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

    _compatibleAndFilters(a, b) {
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
                const less_ops = ['less_than', 'less_than_or_equal_to'];
                const greater_ops = ['greater_than', 'greater_than_or_equal_to'];
                return (less_ops.includes(ka) && greater_ops.includes(kb))
                    || (less_ops.includes(kb) && greater_ops.includes(ka));
            }
        }
        return false;
    }
}

class PreaggregationFiltering {

    /**
     * Generate pre-aggregation filters, i.e. filters that can be
     * applied to the dataset before aggregation.
     * This extracts, from the vizs filters, those compatible to be
     * executed before aggregation.
     * The extracted filters are in an internal tree-like format;
     * each node has a `type` property and various other parameters
     * that depend on the type.
     */
    constructor() {
    }

    // return (partial) filters as an object (JSON) representing the SQL syntax tree
    getFilter(vizFilter) {
        return this._filter(vizFilter);
    }

    _filter(f) {
        return this._and(f) || this._or(f)
            || this._in(f) || this._notIn(f)
            || this._between(f)
            || this._equals(f) || this._notEquals(f)
            || this._lessThan(f) || this._lessThanOrEqualTo(f)
            || this._greaterThan(f) || this._greaterThanOrEqualTo(f)
            || this._blend(f) || null;
    }

    _and(f) {
        if (f instanceof And) {
            // we can ignore nonsupported (null) subexpressions that are combined with AND
            // and keep the supported ones as a partial filter
            const l = [this._filter(f.a), this._filter(f.b)].filter(Boolean).reduce((x, y) => x.concat(y), []);
            if (l.length) {
                if (l.length == 1) {
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

    _or(f) {
        if (f instanceof Or) {
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

    _lessThan(f) {
        return this._cmpOp(f, LessThan, 'lessThan');
    }

    _lessThanOrEqualTo(f) {
        return this._cmpOp(f, LessThanOrEqualTo, 'lessThanOrEqualTo');
    }

    _greaterThan(f) {
        return this._cmpOp(f, GreaterThan, 'greaterThan');
    }

    _greaterThanOrEqualTo(f) {
        return this._cmpOp(f, GreaterThanOrEqualTo, 'greaterThanOrEqualTo');
    }

    _equals(f) {
        return this._cmpOp(f, Equals, 'equals');
    }

    _notEquals(f) {
        return this._cmpOp(f, NotEquals, 'notEquals');
    }

    _cmpOp(f, opClass, type) {
        if (f instanceof opClass) {
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

    _blend(f) {
        if (f instanceof Blend && f.originalMix instanceof Animate) {
            return this._filter(f.b);
        }
    }

    _property(f) {
        if (f instanceof Property) {
            return {
                type: 'property',
                property: f.name
            };
        }
    }

    _value(f) {
        if (f instanceof NumberExpression || f instanceof ConstantExpression || f instanceof CategoryExpression) {
            return {
                type: 'value',
                value: f.expr
            };
        }
    }

    _in(f) {
        if (f instanceof In) {
            let p = this._property(f.value);
            let values = f.list.elems.map(cat => this._value(cat));
            if (p && values.length > 0 && values.length == f.list.elems.length) {
                return {
                    type: 'in',
                    property: p.property,
                    values: values.map(v => v.value)
                };
            }
        }
    }

    _notIn(f) {
        if (f instanceof Nin) {
            let p = this._property(f.value);
            let values = f.list.elems.map(cat => this._value(cat));
            if (p && values.length > 0 && values.length == f.list.elems.length) {
                return {
                    type: 'notIn',
                    property: p.property,
                    values: values.map(v => v.value)
                };
            }
        }
    }

    _between(f) {
        if (f instanceof Between) {
            let p = this._property(f.value);
            let lo = this._value(f.lowerLimit);
            let hi = this._value(f.upperLimit);
            if (p && lo != null && hi != null) {
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

function getSQL(node) {
    if (node.type) {
        return `(${SQLGenerators[node.type](node)})`;
    }
    return sqlQ(node);
}

function sqlQ(value) {
    if (isFinite(value)) {
        return String(value);
    }
    return `'${value.replace(/\'/g,'\'\'')}'`;
}

function sqlId(id) {
    if (!id.match(/^[a-z\d_]+$/)) {
        id = `"${id.replace(/\"/g,'""')}"`;
    }
    return id;
}

function sqlSep(sep, ...args) {
    return args.map(arg => getSQL(arg)).join(sep);
}

const SQLGenerators = {
    'and':                  f => sqlSep(' AND ', f.left, f.right),
    'or':                   f => sqlSep(' OR ', f.left, f.right),
    'between':              f => `${sqlId(f.property)} BETWEEN ${sqlQ(f.lower)} AND ${sqlQ(f.upper)}`,
    'in':                   f => `${sqlId(f.property)} IN (${sqlSep(',', ...f.values)})`,
    'notIn':                f => `${sqlId(f.property)} NOT IN (${sqlSep(',', ...f.values)})`,
    'equals':               f => sqlSep( ' = ', f.left, f.right),
    'notEquals':            f => sqlSep(' <> ', f.left, f.right),
    'lessThan':             f => sqlSep(' < ', f.left, f.right),
    'lessThanOrEqualTo':    f => sqlSep(' <= ', f.left, f.right),
    'greaterThan':          f => sqlSep( ' > ', f.left, f.right),
    'greaterThanOrEqualTo': f => sqlSep(' >= ', f.left, f.right),
    'property':             f => sqlId(f.property),
    'value':                f => sqlQ(f.value)
};

/**
 * Returns supported windshaft filters for the viz
 * @param {*} viz
 * @returns {Filtering}
 */
export function getFiltering(viz, options = {}) {
    const aggrFiltering = new AggregationFiltering(options);
    const preFiltering = new PreaggregationFiltering(options);
    const filtering = {
        preaggregation: preFiltering.getFilter(viz.filter),
        aggregation: aggrFiltering.getFilters(viz.filter)
    };
    if (!filtering.preaggregation && !filtering.aggregation) {
        return null;
    }
    return filtering;
}

/**
 * Convert preaggregation filters (as generated by PreaggregationFiltering)
 * into an equivalent SQL WHERE expression.
 *
 * @param {Filtering} filtering
 */
export function getSQLWhere(filtering) {
    filtering = filtering && filtering.preaggregation;
    let sql;
    if (filtering && Object.keys(filtering).length > 0) {
        sql = getSQL(filtering);
    }
    return sql ? 'WHERE ' + sql : '';
}

export function getAggregationFilters(filtering) {
    return filtering && filtering.aggregation;
}
