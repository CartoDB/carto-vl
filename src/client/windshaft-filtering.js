import { And } from '../core/style/expressions/binary';
import { In, Nin } from '../core/style/expressions/belongs';
import Between from '../core/style/expressions/between';
import Category from '../core/style/expressions/category';
import Float from '../core/style/expressions/float';
import Property from '../core/style/expressions/property';


/**
 * Returns supported windshaft filters for the style
 * @param {*} style 
 */
export function getFiltering(style) {
    return getFilter(style.filter);
}

export function getFilteredSQL(aggSQL, filtering) {
    return 2;
}

function getFilter(f) {
    return getAndFilter(f) || getInFilter(f) || getNinFilter(f) || getBetweenFilter(f) || null;
}

function getAndFilter(f) {
    if (f instanceof And) {
        debugger;
        return [getFilter(f.a), getFilter(f.b)].filter(Boolean).reduce((x, y) => x.concat(y));
    }
}

function getInFilter(f) {
    if (f instanceof In && f.property instanceof Property && f.categories.every(cat => cat instanceof Category)) {
        return [{
            type: 'in',
            property: f.property.name,
            whitelist: f.categories.map(cat => cat.expr)
        }];
    }
}

function getNinFilter(f) {
    if (f instanceof Nin && f.property instanceof Property && f.categories.every(cat => cat instanceof Category)) {
        return [{
            type: 'nin',
            property: f.property.name,
            blacklist: f.categories.map(cat => cat.expr)
        }];
    }
}

function getBetweenFilter(f) {
    if (f instanceof Between &&
        f.value instanceof Property &&
        f.lowerLimit instanceof Float &&
        f.upperLimit instanceof Float
    ) {
        return [{
            type: 'between',
            property: f.value.name,
            lowerLimit: f.lowerLimit.expr,
            upperLimit: f.upperLimit.expr,
        }];
    }
}