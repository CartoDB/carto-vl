/**
 * Export util functions
 */

const DEG2RAD = Math.PI / 180;
const EARTH_RADIUS = 6378137;
const WM_R = EARTH_RADIUS * Math.PI; // Webmercator *radius*: half length Earth's circumference
const WM_2R = WM_R * 2; // Webmercator coordinate range (Earth's circumference)

function projectToWebMercator(latLng) {
    let lat = latLng.lat * DEG2RAD;
    let lng = latLng.lng * DEG2RAD;
    let x = lng * EARTH_RADIUS;
    let y = Math.log(Math.tan(lat / 2 + Math.PI / 4)) * EARTH_RADIUS;
    return { x, y };
}

function isUndefined(value) {
    return value === undefined;
}

function isString(value) {
    return typeof value == 'string';
}

function isNumber(value) {
    return typeof value == 'number';
}

function isObject(value) {
    const type = typeof value;
    return value != null && (type == 'object' || type == 'function');
}
/**
 * Transform the given parameter into a Date object.
 * When a number is given as a parameter is asummed to be a milliseconds epoch.
 * @param {Date|number|string} date
 */
function castDate(date) {
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

function isSetsEqual(a, b) {
    return a.size === b.size && [...a].every(value => b.has(value));
}

export {
    WM_R,
    WM_2R,
    projectToWebMercator,
    isUndefined,
    isString,
    isNumber,
    isObject,
    castDate,
    isSetsEqual
};
