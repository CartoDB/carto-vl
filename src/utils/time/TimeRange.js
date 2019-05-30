import periodISO from './periodISO';
import parseISO from './parseISO';
import timeZoneDate from './TimeZoneDate';

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
    constructor (timeZone, iso, startValue, endValue) {
        this._startValue = startValue;
        this._endValue = endValue;

        if (startValue && endValue) {
            this._iso = periodISO(startValue, endValue);
        } else if (!startValue && !endValue && iso) {
            const startEndValues = _startEndTimeValues(iso);

            this._iso = iso;
            this._startValue = startEndValues[0];
            this._endValue = startEndValues[1];
        }

        // The timezone of a TimeRange is merely informative.
        // No time zone conversion is ever performed, e.g. when
        // several ranges are used in the same linear expression.
        // In same cases (e.g. defining a time range from a text constant)
        // it may not be available.
        this._timeZone = timeZone;
    }

    get timeZone () {
        return this._timeZone;
    }

    get iso () {
        return this._iso;
    }

    get startValue () {
        return this._startValue;
    }

    get endValue () {
        return this._endValue;
    }

    get startDate () {
        return timeZoneDate.fromValue(this._startValue, this._timeZone);
    }

    get endDate () {
        return timeZoneDate.fromValue(this._endValue, this._timeZone);
    }
}

function _timeValue (parsed) {
    return Date.UTC(
        parsed.year,
        parsed.month - 1,
        parsed.day,
        parsed.hour,
        parsed.minute,
        parsed.second
    );
}

function _startEndTimeValues (iso) {
    return parseISO(iso).map(_timeValue);
}
