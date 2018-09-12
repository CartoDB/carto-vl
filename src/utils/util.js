/**
 * Export util functions
 */

const DEG2RAD = Math.PI / 180;
const EARTH_RADIUS = 6378137;
export const WM_R = EARTH_RADIUS * Math.PI; // Webmercator *radius*: half length Earth's circumference
export const WM_2R = WM_R * 2; // Webmercator coordinate range (Earth's circumference)

export function isUndefined (value) {
    return value === undefined;
}

export function isString (value) {
    return typeof value === 'string';
}

export function isNumber (value) {
    return typeof value === 'number';
}

export function isObject (value) {
    const type = typeof value;
    return value !== null && (type === 'object' || type === 'function');
}

export function regExpThatContains (text) {
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // in case it has special symbols
    return new RegExp(escaped);
}

/**
 * Transform the given parameter into a Date object.
 * When a number is given as a parameter is asummed to be a milliseconds epoch.
 * @param {Date|number|string} date
 */
export function castDate (date) {
    if (date instanceof Date) {
        return date;
    }
    if (typeof (date) === 'number') {
        const msEpoch = date;
        date = new Date(0);
        date.setUTCMilliseconds(msEpoch);
        return date;
    }
    return new Date(date);
}

export function isSetsEqual (a, b) {
    return a.size === b.size && [...a].every(value => b.has(value));
}

export function equalArrays (a, b) {
    if (a && b && a.length === b.length) {
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }
}

export function projectToWebMercator (latLng) {
    let lat = latLng.lat * DEG2RAD;
    let lng = latLng.lng * DEG2RAD;
    return {
        x: lng * EARTH_RADIUS,
        y: Math.log(Math.tan(lat / 2 + Math.PI / 4)) * EARTH_RADIUS
    };
}

export function computeMapZoom (map) {
    const bounds = map.getBounds();
    const nw = bounds.getNorthWest();
    const sw = bounds.getSouthWest();
    return (projectToWebMercator(nw).y - projectToWebMercator(sw).y) / WM_2R;
}

export function computeMapCenter (map) {
    const center = map.getCenter();
    const coords = projectToWebMercator(center);
    return {
        x: coords.x / WM_R,
        y: coords.y / WM_R
    };
}

export function computeMatrixZoom (matrix) {
    // The matrix projects spherical mercator coordinates to gl coordinates
    return -(2 * matrix[15] / matrix[5]);
}

export function computeMatrixCenter (matrix) {
    // The matrix projects spherical mercator coordinates to gl coordinates
    return {
        x: -(1 + 2 * matrix[12] / matrix[0]),
        y: +(1 + 2 * matrix[13] / matrix[5])
    };
}

export default {
    WM_R,
    WM_2R,
    isUndefined,
    isString,
    isNumber,
    isObject,
    castDate,
    isSetsEqual,
    equalArrays,
    projectToWebMercator,
    computeMapZoom,
    computeMapCenter,
    computeMatrixZoom,
    computeMatrixCenter
};
