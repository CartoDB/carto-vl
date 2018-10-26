import periodISO from './periodISO';
import parseISO from './parseISO';
import { msToDate } from '../util';

function timeValue (parsed) {
    return Date.UTC(parsed.year, parsed.month - 1, parsed.day, parsed.hour, parsed.minute, parsed.second);
}

function startEndTimeValues (iso) {
    return parseISO(iso).map(timeValue);
}

export default class TimeRange {
    constructor (text, startValue, endValue) {
        this._text = text;
        this._startValue = startValue;
        this._endValue = endValue;
    }
    static fromText (iso) {
        return new TimeRange(iso, ...startEndTimeValues(iso));
    }
    static fromStartEnd (startDate, endDate) {
        const start = startDate && startDate.getTime();
        const end = endDate && endDate.getTime();
        return this.fromStartEndValues(start, end);
    }
    static fromStartEndValues (startValue, endValue) {
        const iso = periodISO(startValue, endValue);
        return new TimeRange(iso, startValue, endValue);
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
        return msToDate(this._startValue);
    }
    get endDate () {
        return msToDate(this._endValue);
    }
}
