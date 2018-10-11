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
 * When a number is given as a parameter is assummed to be a milliseconds epoch (UTC).
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
    return new Date(date);
}

export function msToDate (msEpoch) {
    const date = new Date(0);
    date.setUTCMilliseconds(msEpoch);
    return date;
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

class IsoParser {
    constructor (format) {
        this._format = format;
    }
    check (iso) {
        return iso.match(this._format);
    }
}

function fieldDefault (value, defaultValue) {
    return (value === undefined) ? defaultValue : Number(value);
}

function dateFields (fields) {
    return {
        year: fieldDefault(fields.year, 1),
        month: fieldDefault(fields.month, 1),
        day: fieldDefault(fields.day, 1),
        hour: fieldDefault(fields.hour, 0),
        minute: fieldDefault(fields.minute, 0),
        second: fieldDefault(fields.second, 0)
    };
}

function fieldsFromMatch (match) {
    return dateFields({
        year: match[1],
        month: match[2],
        day: match[3],
        hour: match[4],
        minute: match[5],
        second: match[6]
    });
}

class YMDHMSParser extends IsoParser {
    constructor () {
        super(/^(\d\d\d\d)(?:\-?(\d\d)(?:\-?(\d\d)(?:[T\s]?(\d\d)(?:\:(\d\d)(?:\:(\d\d))?)?)?)?)?$/);
    }
    parse (iso, next) {
        let match = this.check(iso) || [];
        if (next) {
            match = match.slice();
            const i = [1, 2, 3, 4, 5, 6].find(i => match[i] === undefined) || 7;
            if (i === 1) {
                match[1] = 2;
            } else {
                match[i - 1] = Number(match[i - 1]) + 1;
            }
        }
        return fieldsFromMatch(match);
    }
}

class MillenniumParser extends IsoParser {
    constructor () {
        super(/^M(\d+)$/);
    }
    parse (iso, next) {
        const match = this.check(iso);
        let m = Number(match[1]);
        if (next) {
            ++m;
        }
        return dateFields({ year: (m - 1) * 1000 + 1 });
    }
}

class CenturyParser extends IsoParser {
    constructor () {
        super(/^C(\d+)$/);
    }
    parse (iso, next) {
        const match = this.check(iso);
        let c = Number(match[1]);
        if (next) {
            ++c;
        }
        return dateFields({ year: (c - 1) * 100 + 1 });
    }
}

class DecadeParser extends IsoParser {
    constructor () {
        super(/^D(\d+)$/);
    }
    parse (iso, next) {
        const match = this.check(iso);
        let d = Number(match[1]);
        if (next) {
            ++d;
        }
        return dateFields({ year: d * 10 });
    }
}

class SemesterParser extends IsoParser {
    constructor () {
        super(/^(\d\d\d\d)S(\d)$/);
    }
    parse (iso, next) {
        const match = this.check(iso);
        let y = Number(match[1]);
        let s = Number(match[2]);
        if (next) {
            ++s;
        }
        return dateFields({
            year: y,
            month: (s - 1) * 6 + 1
        });
    }
}

class TrimesterParser extends IsoParser {
    constructor () {
        super(/^(\d\d\d\d)t(\d)$/);
    }
    parse (iso, next) {
        const match = this.check(iso);
        let y = Number(match[1]);
        let t = Number(match[2]);
        if (next) {
            ++t;
        }
        return dateFields({
            year: y,
            month: (t - 1) * 4 + 1
        });
    }
}

class QuarterParser extends IsoParser {
    constructor () {
        super(/^(\d\d\d\d)\-?Q(\d)$/);
    }
    parse (iso, next) {
        const match = this.check(iso);
        let y = Number(match[1]);
        let q = Number(match[2]);
        if (next) {
            ++q;
        }
        return dateFields({
            year: y,
            month: (q - 1) * 3 + 1
        });
    }
}

function isoDow (y, m, d) {
    const dow = (new Date(y, m - 1, d)).getDay();
    return dow === 0 ? 7 : dow;
}

function addDays (date, days) {
    const newDate = new Date(date.valueOf());
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}

// compute start date of yWw
function startOfIsoWeek (y, w) {
    const dow = isoDow(y, 1, 1);
    const startDay = dow > 4 ? 9 - dow : 2 - dow;
    const startDate = new Date(y, 0, startDay);
    return addDays(startDate, (w - 1) * 7);
}

class WeekParser extends IsoParser {
    constructor () {
        super(/^(\d\d\d\d)\-?W(\d\d)$/);
    }
    parse (iso, next) {
        const match = this.check(iso);

        let year = Number(match[1]);
        let week = Number(match[2]);
        if (next) {
            ++week;
        }

        const start = startOfIsoWeek(year, week);
        return dateFields({
            year: start.getFullYear(),
            month: start.getMonth() + 1,
            day: start.getDate()
        });
    }
}

const isoFormats = [
    new MillenniumParser(),
    new CenturyParser(),
    new DecadeParser(),
    new SemesterParser(),
    new TrimesterParser(),
    new QuarterParser(),
    new WeekParser(),
    new YMDHMSParser()
];

function findParser (iso) {
    return isoFormats.find(parser => parser.check(iso));
}

function parseIso (iso, next = false) {
    iso = iso || '';
    const parser = findParser(iso);
    return parser.parse(iso, next);
}

function timeValue (parsed) {
    return Date.UTC(parsed.year, parsed.month - 1, parsed.day, parsed.hour, parsed.minute, parsed.second);
}

export function startTimeValue (iso) {
    return timeValue(parseIso(iso, false));
}

export function endTimeValue (iso) {
    return timeValue(parseIso(iso, true));
}

class TimeRange {
    constructor (iso) {
        this._text = iso;
    }
    get text () {
        return this._text;
    }
    get startValue () {
        return startTimeValue(this._text);
    }
    get endValue () {
        return endTimeValue(this._text);
    }
    get startDate() {
        return msToDate(this.startValue);
    }
    get endDate() {
        return msToDate(this.endValue);
    }
};

export function timeRange (t) {
    if (!isTimeRange(t)) {
        t = new TimeRange(t);
    }
    return t;
}

export function isTimeRange(t) {
    return t instanceof TimeRange;
}
