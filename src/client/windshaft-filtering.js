import { And, Or, Equals } from '../core/style/expressions/binary';
import { In, Nin } from '../core/style/expressions/belongs';
import Between from '../core/style/expressions/between';
import Category from '../core/style/expressions/category';
import Float from '../core/style/expressions/float';
import Property from '../core/style/expressions/property';
import Blend from '../core/style/expressions/blend';
import Animate from '../core/style/expressions/animate';
import FloatConstant from '../core/style/expressions/floatConstant';
import { Avg, Mode, Sum } from '../core/style/expressions/aggregation';
import * as schema from '../core/schema';


// TODO: Add options for filter separation mode (A/B); implement API filtering as class to handle parameter

/**
 * Returns supported windshaft filters for the style
 * @param {*} style
 * @returns {Filtering}
 */
export function getFiltering(style) {
    const filtering = {
        preaggregation: getFilter(style.getFilter()),
        aggregation: getAPIFilter(style.getFilter())
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


function isBetweenFilter2(f) {
    return f instanceof Between
        && (f.value instanceof Property || f.value instanceof Avg || f.value instanceof Mode || f.value instanceof Sum) // TODO: add rest of aggregation functions
        && (f.lowerLimit instanceof Float || f.lowerLimit instanceof FloatConstant)
        && (f.upperLimit instanceof Float || f.upperLimit instanceof FloatConstant);
}

function isEqualFilter(f) {
    // support only property == value
    return f instanceof Equals
        && (f.a instanceof Property || f.a instanceof Avg || f.a instanceof Mode || f.a instanceof Sum)  // better use getAggregatedAPIFilter(f.a)
        && (f.b instanceof Float || f.b instanceof FloatConstant || f.b instanceof Category);
}

function getAPIFilter(f) {
    let filters = {};
    for (let p of getAndAPIFilter(f)) {
        let name = p.property;
        if (filters[name]) {
            // can't AND-combine filters for the same property
            return [];
        }
        filters[name] = p.filters;
    }
    return filters;
}

function getAndAPIFilter(f) {
    if (f instanceof And) {
        let a = getOrAPIFilter(f.a);
        let b = getOrAPIFilter(f.b);
        if (!a) {
            return [b];
        }
        if (!b) {
            return [a];
        }
        if (a.property != b.property) {
            return [a, b];
        }
    }
    return [getOrAPIFilter(f)].filter(Boolean);
}

function getOrAPIFilter(f) {
    if (f instanceof Or) {
        let a = getBasicAPIFilter(f.a);
        let b = getBasicAPIFilter(f.b);
        if (a && b) {
            if (a.property == b.property) {
                a.filters = a.filters.concat(b.filters);
                return a;
            }
        }
    }
    return getBasicAPIFilter(f);
}

function getBasicAPIFilter(f) {
    if (isBetweenFilter2(f)) { // TODO all basic expressions: IN, NOT-IN, <, <=, >, >=, = , !=
        let p = getAggregatedAPIFilter(f.value);
        if (p) {
            p.filters.push({
                greater_than_or_equal_to: f.lowerLimit.expr,
                less_than_or_equal_to: f.upperLimit.expr
            });
            return p;
        }
    }
    if (isEqualFilter(f)) {
        let p = getAggregatedAPIFilter(f.a);
        if (p) {
            p.filters.push({
                equal: f.b.expr
            })
        }
        return p;
    }
}

function getAggregatedAPIFilter(f) {
    if (f instanceof Avg || f instanceof Sum || f instanceof Mode) { // if f._aggName
        let p = getPropertyAPIFilter(f.property);
        if (p) {
            p.property = schema.column.aggColumn(p.property, f._aggName);
            return p;
        }
    }

    // // Alternative A. apply separate filters in SQL and Aggr. API
    // return;

    return getPropertyAPIFilter(f);
}


function getPropertyAPIFilter(f) {
    if (f instanceof Property) {
        return {
            property: f.name,
            filters: []
        };
    }
}