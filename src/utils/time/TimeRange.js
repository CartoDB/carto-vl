import periodISO from './periodISO';
import parseISO from './parseISO';
import TZDate from './TZDate';

function timeValue (parsed) {
    return Date.UTC(parsed.year, parsed.month - 1, parsed.day, parsed.hour, parsed.minute, parsed.second);
}

function startEndTimeValues (iso) {
    return parseISO(iso).map(timeValue);
}

/**
 * Class TimeRange represents an interval of time between to instants.
 *
 * Only single unit-of-time intervals such as a calender year, month, day, hour, etc.
 * are supported, arbitrary intervals are not.
 *
 * A TimeRange can be defined and accessed either by its start and end instants
 * or by an abbreviated ISO-formatted textual representation.
 * For the text format, since general intervals are not supported, the ISO interval
 * format is not used, but simply the abbreviated form of the time unit.
 * For example, to represent March 2018, `2018-03` is used instead of the
 * ISO-formatted interval `018-03-01T00:00:00/2018-04-01T00:00:00`.
 *
 * A TimeRange includes its start instant and excludes the end instant:
 * it represents the semi-open interval start <= t < end.
 *
 * @param {String} timezone - Time zone of the range; informational only.
 * @param {String} text - text representation of the range
 * @param {Number} startValue - start of the range as elapsed milliseconds since a timezone-specific epoch
 * @param {Number} endValue - end of the range as elapsed milliseconds since a timezone-specific epoch
 *
 * @constructor Layer
 * @name carto.TimeRange
 * @api
 * */
export default class TimeRange {
    constructor (tz, text, startValue, endValue) {
        this._text = text;
        this._startValue = startValue;
        this._endValue = endValue;
        // The timezone of a TimeRange is merely informative.
        // No time zone conversion is ever performed, e.g. when
        // several ranges are used in the same linear expression.
        // In same cases (e.g. defining a time range from a text constant)
        // it may not be available.
        this._timeZone = tz;
    }

    /**
     * Construct a TimeRange from a time range string
     *
     * @param {String} iso - Abbreviated ISO-formatted string (e.g. `'2018-03'`)
     * @param {String} tz - Optional time zone identification
     * @return {TimeRange}
     * @api
     */
    static fromText (iso, tz = null) {
        return new TimeRange(tz, iso, ...startEndTimeValues(iso));
    }

    /**
     * Construct a TimeRange from start and end epoch values in milliseconds
     * interpreted as in the specified time zone (UTC by default).
     *
     * @param {Number} startValue - start of the range as elapsed milliseconds since a timezone-specific epoch
     * @param {Number} endValue - end of the range as elapsed milliseconds since a timezone-specific epoch
     * @param {String} tz - Optional time zone identification
     * @return {TimeRange}
     * @api
     */
    static fromStartEndValues (startValue, endValue, tz = null) {
        const iso = periodISO(startValue, endValue);
        return new TimeRange(tz, iso, startValue, endValue);
    }

    get timeZone () {
        return this._timeZone;
    }

    get text () {
        return this._text;
    }

    get startValue () {
        return this._startValue;
    }

    get endValue () {
        return this._endValue;
    }

    get startDate () {
        return TZDate.fromValue(this._startValue, this._timeZone);
    }

    get endDate () {
        return TZDate.fromValue(this._endValue, this._timeZone);
    }
}
