import ClusterTimeDimension from './ClusterTimeDimension';
import { checkExpression, checkMaxArguments, checkStringValue } from '../../utils';

/**
 * Use discretised property as aggregate dimension. This operation disables the access to the property
 * except within `clusterTime` expressions with the same parameters.
 *
 * Note: `clusterTime` can only be created with a {@link carto.expressions.prop|carto.expressions.prop},
 * as the first parameter, not other expressions.
 *
 * When the units of resolution are cyclic periods such as 'dayOfWeek' (day of the week) or 'monthOfYear' (month of the year),
 * the resulting expression takes a numeric value to represent the period, e.g. 1 for Monday or January.
 *
 * When the units are not cyclic (e.g. 'week' or 'month'), the resulting expression is a `TimeRange` that
 * encompass each individual calendar period, for example week 2018-W03 (third week of 2018 from 2018-01-15 to 2018-01-21)
 * or 2018-03 (March 2018, from 2018-03-01 to 2018-04-01).
 *
 * Accepted values for cyclic resolution periods are:
 * - `semesterOfYear` (6-month term) takes values from 1 to 2
 * - `trimesterOfYear` (4-month term) takes values from 1 to 3
 * - `quarterOfYear` (3-month term) takes values from 1 to 4
 * - `monthOfYear` takes values from 1 (January) to 12 (December)
 * - `weekOfYear` follows [ISO 8601 numbering](https://en.wikipedia.org/wiki/ISO_week_date) taking values from 1 up to 53
 * - `dayOfWeek` (as per ISO 8601, 1 = Monday, to 7 = Sunday
 * - `dayOfMonth` takes values from 1 to 31
 * - `dayOfYear` takes values from 1 to 366
 * - `hourOfDay` takes values from 0 to 23
 * - `minuteOfHour` takes values from 0 to 59
 *
 * Accepted values for serial resolution units are:
 *
 * - `year`, e.g. '2017'
 * - `month`, e.g. '2017-03'
 * - `day`, e.g. '2017-03-01'
 * - `hour`, e.g. '2017-03-01T13'
 * - `minute`, e.g. '2017-03-01T13:22'
 * - `second`, e.g. '2017-03-01T13:22:31'
 * - `week` represented as '2018-W03' (third week of 2018:, 2018-01-15 to 2018-01-21)
 * - `quarter` as '2018-Q2' (second quarter of 2018, i.e. 2018-04 to 2018-06)
 * - `semester` as '2018S2' (second semester of 2018, i.e. 2018-07 to 2018-12)
 * - `trimester` as '2018t2' (second trimester of 2018, i.e. 2018-05 to 2018-08)
 * - `decade` as 'D201' (decade 201, i.e. 2010 to 2019)
 * - `century` as 'C21' (21st century, ie. 2001 to 2100)
 * - `millennium` as 'M3' (3rd millennium: 2001 to 3000)
 *
 * The time zone is optional. By default UTC time will be used.
 * It admits a fixed offset from UTC as a signed number of seconds,
 * or [IANA](https://www.iana.org/time-zones) timezone [names](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
 * such as `America/New_York` or `Europe/Madrid`, which not only define a time offset,
 * but also rules for DST (daylight savings time).
 *
 * @param {Date} property - Column of the table to be discretised as dimension
 * @param {String} units - Units of resolution for the discretization
 * @param {String} timezone - Time zone in which the dates are discretised. UTC by default.
 * @return {TimeRange|Number} Dimension column; takes time range values (intervals) for serial units of resolutions and numbers for recurrent units.
 *
 * @example <caption>Use months as a dimension of the cluster aggregations as `month`.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   month: s.clusterTime(s.prop('date', 'month', 'America/New_York'))
 * });
 *
 * @example <caption>Use months as a dimension of the cluster aggregations as `month`. (String)</caption>
 * const viz = new carto.Viz(`
 *   month: clusterTime($date, 'month', 'America/New_York')
 * `);
 *
 * @memberof carto.expressions
 * @name ClusterTime
 * @function
 * @api
 */
export default class ClusterTime extends ClusterTimeDimension {
    constructor (property, units, timezone) {
        const expressionName = 'clusterTime';
        const isCyclic = ClusterTimeDimension.cyclicUnits.includes(units);
        checkMaxArguments(arguments, 3, expressionName);
        checkExpression(expressionName, 'property', 0, property);
        const validUnits = isCyclic ? ClusterTimeDimension.cyclicUnits : ClusterTimeDimension.serialUnits;
        checkStringValue(expressionName, 'units', 1, units, validUnits);
        super({
            property,
            expressionName,
            dimension: {
                group: {
                    units: units,
                    timezone
                },
                format: isCyclic ? 'number' : 'iso'
            },
            type: isCyclic ? 'number' : 'timerange',
            range: isCyclic ? undefined : []
        });
    }
    converse (v) {
        return v;
    }
}
