import TimeRange from './time/TimeRange';
import { mat4 } from 'gl-matrix';
import { unproject } from './geometry';

/**
 * Export util functions
 */
import CartoValidationError, { CartoValidationTypes as cvt } from '../errors/carto-validation-error';

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
 * When a number is given as a parameter is assumed to be a milliseconds epoch (UTC).
 * The result is a local Date.
 * @param {Date|number|string} date
 */
export function castDate (date) {
    if (date instanceof Date) {
        return date;
    }
    if (typeof (date) === 'number') {
        return msToDate(date);
    }
    if (isString(date)) {
        return new Date(date);
    } else {
        throw new CartoValidationError(`${cvt.INCORRECT_TYPE} Invalid Date type`);
    }
}

export function msToDate (msEpoch) {
    return new Date(msEpoch);
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

export function computeViewportFromCameraMatrix (matrix) {
    const inv = mat4.invert([], matrix);

    const corners = [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1]
    ].map(NDC =>
        unproject(inv, ...NDC)
    ).map(c =>
        // Our API works on the [-1,1] range, convert from [0,1] range to  [-1, 1] range
        c.map(x => x * 2 - 1)
    );

    // Rotation no longer guarantees that corners[0] will be the minimum point of the AABB and corners[3] the maximum,
    // we need to compute the AABB min/max by iterating
    const min = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
    const max = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
    corners.forEach(corner => {
        min[0] = Math.min(min[0], corner[0]);
        min[1] = Math.min(min[1], corner[1]);
        max[0] = Math.max(max[0], corner[0]);
        max[1] = Math.max(max[1], corner[1]);
    });

    // Our API flips the `y` coordinate, we need to convert the values accordingly
    min[1] = -min[1];
    max[1] = -max[1];
    const temp = min[1];
    min[1] = max[1];
    max[1] = temp;

    return [...min, ...max];
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
    computeMatrixZoom,
    computeMatrixCenter,
    computeViewportFromCameraMatrix
};

export function castTimeRange (v, tz = null) {
    if (v === undefined || isTimeRange(v)) {
        if (v && tz) {
            return timeRange({ iso: v.text, timeZone: tz });
        }
        return v;
    }
    if (typeof v === 'string') {
        return timeRange({ iso: v, timeZone: tz });
    }
}

export function timeRange (parameters) {
    const { start, end, iso, timeZone } = parameters;
    if (iso) {
        return TimeRange.fromText(iso, timeZone);
    } else {
        return TimeRange.fromStartEndValues(start, end, timeZone);
    }
}

export function isTimeRange (t) {
    return t instanceof TimeRange;
}
