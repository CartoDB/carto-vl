## Introduction

When backend aggregations are in use (for Windshaft sources), data is clustered spatially, and the clusterAggregations expressions give you the values of data properties summarised over the aggregation clusters (for example `clusterMax($temperature)`, `clusterAvg($price)`, `clusterSum($population)`.

If a property is used out of any cluster aggregation expression, then it becomes a dimension of the data: it's used for clustering along with the spatial grid (just like [torque cubes](http://gijs.github.io/images/cartodb_datacubes.pdf#page=26)).

But usually that means that the aggregation is not so effective anymore, because the data cluster will be split by every single distinct value of the property, potentially dividing into a myriad of small clusters, often containing just a single feature.

The `clusterTime` expression allows you to use a time property as an aggregation dimension (rather than as an aggregated value as with the cluster aggregation expressions like `clusterSum`, etc.) in a controlled manner; that is, specifying how to discretise it so that we don't have too many unique values.

So clusterTime is a kind of classification or grouping into buckets methods. It lets you choose how a time property can be grouped into units of time (say months, days, minutes, ...) and then have each cluster of data be split by each unique value of this unit that occurs. For example `clusterTime($date, 'month')`, `clusterTime($arrival_time, 'dayOfWeek')`.

To use aggregations effectively, each property to be used should be wrapped in either a cluster aggregation expression (`clusterSum`, `clusterAvg`, `clusterMin`, ...) or in a `clusterTime` expression. In the first case we obtained an aggregate of the property value over each cluster. In the second, the classified property becomes an aggregation dimension.

## `clusterTime` parameters

The expression for discretizing a date property of the date and use it as a dimensions of the clustered data has the form:

```
clusterTime(property, units, timezone)
```

First argument is the date property to use. For any time property present in the data, at most one time dimension can be used on it.

The second argument `units` defines the resolution of the time discretization, for example months, days, hours, etc.

The optional `timezone` parameter is used to adjust the dates before being discretized, so it delimits the start of days and determines the hour values.
The default value is 'UTC'. It admits a fixed offset from UTC  as a signed number of seconds, or [IANA](https://www.iana.org/time-zones) timezone [names](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) such as `America/New_York` or `Europe/Madrid`, which not only define a time offset,
but also rules for DST (daylight savings time).

There's two different kind of `units`: recurring cyclic units like month of the year or day of the week and serial calendar periods like years, months, days, ...

The type of units determines the type of the expression result: for cyclic the type is number: e.g. 1-12 for month of the year, 1-7 for day of the week, etc.

For serial, the type is `TimeRange` which encapsulates a period of time (a year, a month, a minute, ...)

A `TimeRange` has these properties:
* `text` an ISO8601-based representation of the period, e.g. '2018-04' for a month, '2018-04-01T03' for an hour.
* `startDate`, `endDate` are the start and end of the period; note that the period is defined as `startDate <= t < endDate`, so the end date is just after the end of the period, for example the start of April 2018 is 2018-04-01T00:00:00 and the end is 2018-04-02T00:00:00. See below for information about the type of these dates, `TZDate`.

### Cyclic (recurring) units as numeric values

* `semesterOfYear` (1:2) (6-month term)
* `trimesterOfYear` (1:3) (4-month term)
* `quarterOfYear` (1:4) (3-month term)
* `monthOfYear` (1:12)
* `weekOfYear` (1:53) follows [ISO 8601 numbering](https://en.wikipedia.org/wiki/ISO_week_date)
* `dayOfWeek` (1:7) as per ISO 8601, 1 = Monday, etc.
* `dayOfMonth` (1:31)
* `dayOfYear` (1:366)
* `hourOfDay` (0:23)
* `minuteOfHour` (0:59)

### Time range units and its text representation

The format is based on [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601):

* `year` 'YYYY'
* `month` 'YYYY-MM'
*  `day` 'YYYY-MM-DD'
*  `hour` 'YYYY-MM-DDThh'
*  `minute` 'YYYY-MM-DDThh:mm'
*  `second` 'YYYY-MM-DDThh:mm:ss'
* `week` represented as '2018-W03' (third week of 2018:, 2018-01-15 to 2018-01-21)
* `quarter` (three months) as '2018-Q2' (second quarter of 2018, i.e. 2018-04 to 2018-06)
* `semester` (six months) as '2018S2' (second semester of 2018, i.e. 2018-07 to 2018-12)
* `trimester` (four months) as '2018t2' (second trimester of 2018, i.e. 2018-05 to 2018-08)
* `decade` as 'D201' (decade 201, i.e. 2010 to 2019)
* `century` as 'C21' (21st century, ie. 2001 to 2100)
* `millennium` as 'M3' (3rd millennium: 2001 to 3000)

## Usage

For the numeric case, the `clusterTime` expression can be used as any other numeric value inside linear, animation, etc. filter doesn't support it yet

For the time ranges, linear and animation have special support for this type. Animation behaves in a special way with a time range: it will hold for the duration of each time range, and fade in/out will be applied before and after the periods. (the behaviour can be disabled by wrapping the time range in a linear expression, which will be based on the start date of the time ranges)

viewportFeatures and interactivity is also compatible with clusterTime

### Animation

When applied to a `TimeRange` (e.g. through `clusterTime`), `animation` has a slightly different behavior than with other inputs.

The progress of the animation will be a date (of class `TZDate`), and it will yield continuous values, interpolated from the start of the first time range to the end of the last time range. So even though the values of the input expression at each feature will be discrete values (e.g. months), the progress time will take continuous values, progressing through days, hours, etc.

When the progress enters a given discrete value (a time range), the features with that value will match it for as long as the progress date remains within that range. The fade in and fade out durations will apply to progress values before and after entering the time range.

### Notes

like `clusterAvg` etc., using `clusterTime` precludes usage of the property directly. What's more, unlike cluster aggregation functions, once you use clusterTime on a property, that property can only appear inside clusterTime with the same arguments

#### Date objects

A JavaScript `Date` object keeps a UTC tiempstamp internally ad it can represent it as either UTC or converted to the local system time zone.

So, for dates, which the data sources provide always in UTC form, we use `Date` to present them on the JavaScript side.

`TimeRange` values, on the other hand, are in relation to the time zone specified
through the `clusterTime` expression (UTC by default). The backend provides this values, but the client has no information to transform them to other zones: its start and end instants, defined by year, month, day, hour, minute and second,
cannot be converted in the client to any other time zone.
(Well, you can if you use a library such as [Moment Timezone](https://momentjs.com/timezone/) or [Luxon](https://moment.github.io/luxon/); note that the difficulty lies in than in general time zones are not a constant offset from UTC, but deal with DST --daylight saving time-- as well).

So we don't use `Date` for the `TimeRange` limits, but a special type `TZDate`,
that lets you access it as a text representation or as year, month, day, hour, minute, second fields, and also can contain an identification of the time zone used (not if defined by constant string).

For example, if an `animation` is applied to a time range, like
`animation(clusterTime($ate, 'hour', tz))`, the progress value
obtained by `getProgressValue` is of this type (because it's not a UTC or local time but a time in the `tz` zone).

If the animation is applied to a date instead (`animation($date)`),
the progress will be a `Date` value.

#### What happens during the DST changes?

When the time range is requested for a time zone with DST, around the winter change we can have values that originally were distinct (as UTC values) but are clustered into the same time range of the time zone. During the summer change there will be no aliased values. But gaps may occur
