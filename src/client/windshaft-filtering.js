import { And, Or, Equals, NotEquals, LessThan, LessThanOrEqualTo, GreaterThan, GreaterThanOrEqualTo } from '../core/style/expressions/binary';
import { In, Nin } from '../core/style/expressions/belongs';
import Between from '../core/style/expressions/between';
import Category from '../core/style/expressions/category';
import Float from '../core/style/expressions/float';
import Property from '../core/style/expressions/property';
import Blend from '../core/style/expressions/blend';
import Animate from '../core/style/expressions/animate';
import FloatConstant from '../core/style/expressions/floatConstant';
import { Max, Min, Avg, Sum, Mode } from '../core/style/expressions/aggregation';
import * as schema from '../core/schema';

class AggregationFiltering {
    constructor(options) {
        this._onlyAggregateFilters = options.onlyAggregateFilters;
    }

    getFilters(styleFilter) {
        let filters = {};
        let filterList = this._and(styleFilter).filter(Boolean);
        for (let p of filterList) {
            let name = p.property;
            if (filters[name]) {
                // can't AND-combine filters for the same property
                return [];
            }
            filters[name] = p.filters;
        }
        return filters;
    }

    _and(f) {
        if (f instanceof And) {
            let a = this._or(f.a);
            let b = this._or(f.b);
            if (!a) {
                return [b];
            }
            if (!b) {
                return [a];
            }
            if (a.property != b.property) {
                return [a, b];
            }
            if (this._compatibleAndFilters(a, b)) {
                // adjacent AND inequalities on the same property/aggregation
                // are combined, when possible, into a range filter
                Object.assign(a.filters[0], b.filters[0]);
                return [a];
            }
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

    _basicCondition(f) {
        return this._between(f)
            || this._equals(f) || this._notEquals(f)
            || this._lessThan(f) || this._lessThanOrEqualTo(f)
            || this._greaterThan(f) || this._greaterThanOrEqualTo(f)
            || this._in(f) || this._notIn(f);
    }

    _value(f) {
        if (f instanceof Float || f instanceof FloatConstant || f instanceof Category) {
            return f.expr;
        }
    }

    _between(f) {
        if (f instanceof Between) {
            let p = this._aggregation(f.value);
            let lo = p && this._value(f.lowerlimit);
            let hi = p && lo && this._value(f.lowerLimit);
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
            let values = f.categories.map(c => this._value(c)).filter(v => v != null);
            if (p && values.length > 0 && values.length == f.categories.length) {
                p.filters.push({
                    in: values
                });
            }
        }
    }

    _notIn(f) {
        if (f instanceof Nin) {
            let p = this._aggregation(f.value);
            let values = f.categories.map(c => this._value(c)).filter(v => v != null);
            if (p && values.length > 0 && values.length == f.categories.length) {
                p.filters.push({
                    not_in: values
                });
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
        if (f instanceof Max || f instanceof Min || f instanceof Avg || f instanceof Sum || f instanceof Mode) {
            let p = this._property(f.property);
            if (p) {
                p.property = schema.column.aggColumn(p.property, f._aggName);
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
        if (a.property == b.property) {
            if (a.filters.length === 0 || b.filters.length === 0) {
                return true;
            }
            if (a.filters.length === 1 && b.filters.length === 1) {
                const af = a.filters[0];
                const bf = b.filters[0];
                if (Object.keys(af).length === 1 && Object.keys(bf).length === 1) {
                    const ka = Object.keys(af)[0];
                    const kb = Object.keys(bf)[0];
                    const less_ops = ['less_than', 'less_than_or_equal_to'];
                    const greater_ops = ['greater_than', 'greater_than_or_equal_to'];
                    return (less_ops.includes(ka) && greater_ops.includes(kb))
                        || (less_ops.includes(kb) && greater_ops.includes(ka));
                }
            }
        }
        return false;
    }
}

/**
 * Returns supported windshaft filters for the style
 * @param {*} style
 * @returns {Filtering}
 */
export function getFiltering(style, options = {}) {
    const aggrFiltering = new AggregationFiltering(options);
    const filtering = {
        preaggregation: getFilter(style.getFilter()),
        aggregation: aggrFiltering.getFilters(style.getFilter())
    };
    if (!filtering.preaggregation && !filtering.aggregation) {
        return null;
    }
    return filtering;
}

/**
 *
 * @param {Filtering} filtering
 */
export function getSQLWhere(filtering) {
    filtering = filtering && filtering.preaggregation;
    if (!filtering || filtering.length == 0) {
        return '';
    }
    return 'WHERE ' + getAndSQL(filtering);
}

export function getAggregationFilters(filtering) {
    return filtering && filtering.aggregation;
}


function getAndSQL(filters) {
    return filters.map(filter => getSQL(filter)).join(' AND ');
}

function getSQL(f) {
    return getOrSQL(f) || getBetweenSQL(f) || getInSQL(f) || getNinSQL(f) || '';
}

function getBetweenSQL(f) {
    if (f.type == 'between') {
        return `(${f.property} BETWEEN ${f.lowerLimit} AND ${f.upperLimit})`;
    }
}

function getInSQL(f) {
    if (f.type == 'in') {
        return `(${f.property} IN (${f.whitelist.map(cat => `'${cat}'`).join()}))`;
    }
}

function getNinSQL(f) {
    if (f.type == 'nin') {
        return `(${f.property} NOT IN (${f.blacklist.map(cat => `'${cat}'`).join()}))`;
    }
}

function getOrSQL(f) {
    if (f.type == 'or') {
        return `(${getAndSQL(f.first)} OR ${getAndSQL(f.second)})`;
    }
}

function getFilter(f) {
    return getAndFilter(f) || getOrFilter(f) ||getInFilter(f) || getNinFilter(f) || getBetweenFilter(f) || getBlendFilter(f) || null;
}

function getAndFilter(f) {
    if (f instanceof And) {
        // we can ignore nonsupported (null) subexpressions and yet support partial filtering
        // note that expression lists are combined with AND
        const l = [getFilter(f.a), getFilter(f.b)].filter(Boolean).reduce((x, y) => x.concat(y), []);
        return l.length ? l : null;
    }
}

function getOrFilter(f) {
    if (f instanceof Or) {
        // if any subexpression is not supported the OR combination isn't supported either
        let a = getFilter(f.a);
        let b = getFilter(f.b);
        if (a && b) {
            return [{
                type: 'or',
                first: a,
                second: b
            }];
        }
    }
}

function getBlendFilter(f) {
    if (f instanceof Blend && f.originalMix instanceof Animate) {
        return getFilter(f.b);
    }
}

function getInFilter(f) {
    if (f instanceof In && f.value instanceof Property && f.categories.every(cat => cat instanceof Category) && f.categories.length > 0) {
        return [{
            type: 'in',
            property: f.value.name,
            whitelist: f.categories.map(cat => cat.expr)
        }];
    }
}

function getNinFilter(f) {
    if (f instanceof Nin && f.value instanceof Property && f.categories.every(cat => cat instanceof Category) && f.categories.length > 0) {
        return [{
            type: 'nin',
            property: f.value.name,
            blacklist: f.categories.map(cat => cat.expr)
        }];
    }
}

function getBetweenFilter(f) {
    if (isBetweenFilter(f)) {
        return [{
            type: 'between',
            property: f.value instanceof Property ? f.value.name : f.value.property.name,
            lowerLimit: f.lowerLimit.expr,
            upperLimit: f.upperLimit.expr,
        }];
    }
}

function isBetweenFilter(f) {
    return f instanceof Between
        && (f.value instanceof Property)
        && (f.lowerLimit instanceof Float || f.lowerLimit instanceof FloatConstant)
        && (f.upperLimit instanceof Float || f.upperLimit instanceof FloatConstant);
}
