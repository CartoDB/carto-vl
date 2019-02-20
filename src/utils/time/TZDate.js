import { msToDate } from '../util';
import periodISO from './periodISO';

// Time-zone neutral date
// TODO: name: TimeZoneLessDate, NeutralDate, DateWithoutTimeZone, ...
// it has an optional informational time zone string to declare the
// original TZ
// The idea is that this represent a date, just like a Date object,
// but in relation ot some externally defined time zone
// (the time zone specified in a clusterTime expression),
// so we want to avoid the time zone handling that Date does.
// (this dates cannot be converted from the tz they're specified in,
// not even to UTC)
export default class TZDate {
    constructor (milliseconds, tz) {
        this._value = milliseconds;
        this._date = msToDate(milliseconds);
        this._timeZone = tz; // informational
    }
    static fromValue (milliseconds, tz) {
        return new TZDate(milliseconds, tz);
    }
    static from (year, month, day, hour, minute, second, tz) {
        return this.fromValue(Date.UTC(year, (month || 1) - 1, day, hour, minute, second), tz);
    }
    // static fromUTCDate (date) {
    //     return this.fromValue(date.getTime());
    // }

    get year () {
        return this._date.getUTCFullYear();
    }
    get month () {
        return this._date.getUTCMonth() + 1;
    }
    get day () {
        return this._date.getUTCDate();
    }
    get hour () {
        return this._date.getUTCHours();
    }
    get minute () {
        return this._date.getUTCMinutes();
    }
    get second () {
        return this._date.getUTCSeconds();
    }
    get text () {
        return periodISO(this._date.getTime(), this._date.getTime() + 1000);
    }
    get timeZone () {
        return this._timeZone;
    }
}
