import periodISO from './periodISO';
import parseISO from './parseISO';
import TZDate from './TZDate';

function timeValue (parsed) {
    return Date.UTC(parsed.year, parsed.month - 1, parsed.day, parsed.hour, parsed.minute, parsed.second);
}

function startEndTimeValues (iso) {
    return parseISO(iso).map(timeValue);
}

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
    // construct TimeRange given ISO period string
    static fromText (iso, tz = null) {
        return new TimeRange(tz, iso, ...startEndTimeValues(iso));
    }
    // static fromStartEnd (startDate, endDate) {
    //     const start = startDate && startDate.getTime();
    //     const end = endDate && endDate.getTime();
    //     return this.fromStartEndValues(start, end);
    // }

    // construct TimeRange from start and end epoch values in milliseconds
    // interpreted as in the specified time zone (UTC by default).
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

    // caveat if time zone of the time range is not UTC,
    // the date is set to UTC values, so the Date's time zone
    // values are
    get startDate () {
        return TZDate.fromValue(this._startValue, this._timeZone);
    }
    get endDate () {
        return TZDate.fromValue(this._endValue, this._timeZone);
    }
}
