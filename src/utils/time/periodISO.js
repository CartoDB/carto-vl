import { msToDate } from '../util';

const TIME_LEVELS = ['year', 'month', 'day', 'hour', 'minute', 'second'];
const TIME_STARTS = [1, 1, 1, 0, 0, 0];
const YEAR_LEVEL = 0;
const MONTH_LEVEL = 1;
const DAY_LEVEL = 2;
const HOUR_LEVEL = 3;
const MINUTE_LEVEL = 4;
const SECOND_LEVEL = 5;

const MS_PER_DAY = 86400000;
const MS_PER_HOUR = 3600000;
const MS_PER_MINUTE = 60000;
const MS_PER_S = 1000;

function startLevel (parsed) {
    let i = TIME_LEVELS.length - 1;
    while (i > 0 && parsed[TIME_LEVELS[i]] === TIME_STARTS[i]) {
        --i;
    }
    return i;
}

function pad (x, n) {
    return x.toString().padStart(n, '0');
}

function parsedValue (dateValue) {
    const date = msToDate(dateValue);
    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        hour: date.getUTCHours(),
        minute: date.getUTCMinutes(),
        second: date.getUTCSeconds()
    };
}

function isoDow (y, m, d) {
    const dow = (new Date(y, m - 1, d)).getDay();
    return dow === 0 ? 7 : dow;
}

function invalidPeriod (period, invalid) {
    throw new Error(`Invalid period of ${invalid} between ${period.v1} and ${period.v2}`);
}

// Return year and week number given year and day number
function yearWeek (y, yd) {
    const dow = isoDow(y, 1, 1);
    const start = dow > 4 ? 9 - dow : 2 - dow;
    if ((Math.abs(yd - start) % 7) !== 0) {
        // y yd is not the start of any week
        return [];
    }
    if (yd < start) {
        // The week starts before the first week of the year => go back one year
        yd += Math.round((Date.UTC(y, 0, 1) - Date.UTC(y - 1, 0, 1)) / MS_PER_DAY);
        return yearWeek(y - 1, yd);
    } else if (Date.UTC(y, 0, 1) + (yd - 1 + 3) * MS_PER_DAY >= Date.UTC(y + 1, 0, 1)) {
        // The Wednesday (start of week + 3) lies in the next year => advance one year
        yd -= Math.round((Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1)) / MS_PER_DAY);
        return yearWeek(y + 1, yd);
    }
    return [y, 1 + Math.round((yd - start) / 7)];
}

function yearsPeriod (period) {
    const d = period.t2['year'] - period.t1['year'];
    if (d === 1000 && ((period.t1['year'] - 1) % 1000) === 0) {
        // millennium
        return `M${1 + (period.t1['year'] - 1) / 1000}`;
    } else if (d === 100 && ((period.t1['year'] - 1) % 100) === 0) {
        // century
        return `C${1 + (period.t1['year'] - 1) / 100}`;
    } else if (d === 10 && (period.t1['year'] % 10) === 0) {
        // decade
        return `D${period.t1['year'] / 10}`;
    } else if (d === 1) {
        // year
        return pad(period.t1['year'], 4);
    } else {
        invalidPeriod(`${d} years`);
    }
}

function monthsPeriod (period) {
    const d = 12 * period.t2['year'] + period.t2['month'] - 12 * period.t1['year'] - period.t1['month'];
    if (d === 6 && ((period.t1['month'] - 1) % 6) === 0) {
        // semester
        return `${pad(period.t1['year'], 4)}S${1 + (period.t1['month'] - 1) / 6}`;
    } else if (d === 4) {
        // trimester
        return `${pad(period.t1['year'], 4)}t${1 + (period.t1['month'] - 1) / 4}`;
    } else if (d === 3) {
        // quarter
        return `${pad(period.t1['year'], 4)}-Q${1 + (period.t1['month'] - 1) / 3}`;
    } else if (d === 1) {
        // month
        return `${pad(period.t1['year'], 4)}-${pad(period.t1['month'], 2)}`;
    } else {
        invalidPeriod(`${d} months`);
    }
}

function daysPeriod (period) {
    const d = Math.round((period.v2 - period.v1) / MS_PER_DAY);
    if (d === 1) {
        // day
        return `${pad(period.t1['year'], 4)}-${pad(period.t1['month'], 2)}-${pad(period.t1['day'], 2)}`;
    } else if (d === 7) {
        // week
        let y = period.t1['year'];
        const v0 = Date.UTC(y, 0, 1);
        let yd = 1 + Math.round((period.v1 - v0) / MS_PER_DAY);
        const [iy, w] = yearWeek(y, yd);
        if (iy && w) {
            return `${pad(iy, 4)}-W${pad(w, 2)}`;
        }
        invalidPeriod('7 days');
    } else {
        invalidPeriod(`${d} days`);
    }
}

function hoursPeriod (period) {
    const d = Math.round((period.v2 - period.v1) / MS_PER_HOUR);
    if (d === 1) {
        // hour
        return `${pad(period.t1['year'], 4)}-${pad(period.t1['month'], 2)}-${pad(period.t1['day'], 2)}T${pad(period.t1['hour'], 2)}`;
    } else {
        invalidPeriod(`${d} hours`);
    }
}

function minutesPeriod (period) {
    const d = Math.round((period.v2 - period.v1) / MS_PER_MINUTE);
    if (d === 1) {
        // minute
        return `${pad(period.t1['year'], 4)}-${pad(period.t1['month'], 2)}-${pad(period.t1['day'], 2)}T${pad(period.t1['hour'], 2)}:${pad(period.t1['minute'], 2)}`;
    } else {
        invalidPeriod(`${d} minutes`);
    }
}

function secondsPeriod (period) {
    const d = Math.round((period.v2 - period.v1) / MS_PER_S);
    if (d === 1) {
        // second
        return `${pad(period.t1['year'], 4)}-${pad(period.t1['month'], 2)}-${pad(period.t1['day'], 2)}T${pad(period.t1['hour'], 2)}:${pad(period.t1['minute'], 2)}:${pad(period.t1['second'], 2)}`;
    } else {
        invalidPeriod(`${d} seconds`);
    }
}

export default function periodISO (v1, v2) {
    const t1 = parsedValue(v1);
    const t2 = parsedValue(v2);
    const l1 = startLevel(t1);
    const l2 = startLevel(t2);
    const period = { v1, v2, t1, t2 };

    if (Math.max(l1, l2) === YEAR_LEVEL) {
        return yearsPeriod(period);
    } else if (Math.max(l1, l2) === MONTH_LEVEL) {
        return monthsPeriod(period);
    } else if (Math.max(l1, l2) === DAY_LEVEL) {
        return daysPeriod(period);
    } else if (Math.max(l1, l2) === HOUR_LEVEL) {
        return hoursPeriod(period);
    } else if (Math.max(l1, l2) === MINUTE_LEVEL) {
        return minutesPeriod(period);
    } else if (Math.max(l1, l2) === SECOND_LEVEL) {
        return secondsPeriod(period);
    }
    invalidPeriod(period, 'fractional seconds');
}
