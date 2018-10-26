import CartoParsingError from '../../errors/carto-parsing-error';

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
    parse (iso) {
        const start = this.check(iso) || [];
        const end = start.slice();
        const i = [1, 2, 3, 4, 5, 6].find(i => end[i] === undefined) || 7;
        if (i === 1) {
            end[1] = 2;
        } else {
            end[i - 1] = Number(end[i - 1]) + 1;
        }
        return [ fieldsFromMatch(start), fieldsFromMatch(end) ];
    }
}

class MillenniumParser extends IsoParser {
    constructor () {
        super(/^M(\d+)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const m = Number(match[1]);
        const year = m => (m - 1) * 1000 + 1;
        return [
            dateFields({ year: year(m) }),
            dateFields({ year: year(m + 1) })
        ];
    }
}

class CenturyParser extends IsoParser {
    constructor () {
        super(/^C(\d+)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const c = Number(match[1]);
        const year = c => (c - 1) * 100 + 1;
        return [
            dateFields({ year: year(c) }),
            dateFields({ year: year(c + 1) })
        ];
    }
}

class DecadeParser extends IsoParser {
    constructor () {
        super(/^D(\d+)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const d = Number(match[1]);
        const year = d => d * 10;
        return [
            dateFields({ year: year(d) }),
            dateFields({ year: year(d + 1) })
        ];
    }
}

class SemesterParser extends IsoParser {
    constructor () {
        super(/^(\d\d\d\d)S(\d)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const year = Number(match[1]);
        const s = Number(match[2]);
        const month = s => (s - 1) * 6 + 1;
        return [
            dateFields({ year, month: month(s) }),
            dateFields({ year, month: month(s + 1) })
        ];
    }
}

class TrimesterParser extends IsoParser {
    constructor () {
        super(/^(\d\d\d\d)t(\d)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const year = Number(match[1]);
        const t = Number(match[2]);
        const month = t => (t - 1) * 4 + 1;
        return [
            dateFields({ year, month: month(t) }),
            dateFields({ year, month: month(t + 1) })
        ];
    }
}

class QuarterParser extends IsoParser {
    constructor () {
        super(/^(\d\d\d\d)\-?Q(\d)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const year = Number(match[1]);
        const q = Number(match[2]);
        const month = q => (q - 1) * 3 + 1;
        return [
            dateFields({ year, month: month(q) }),
            dateFields({ year, month: month(q + 1) })
        ];
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
    parse (iso) {
        const match = this.check(iso);
        const year = Number(match[1]);
        const week = Number(match[2]);
        const start = startOfIsoWeek(year, week);
        const end = startOfIsoWeek(year, week + 1);
        const fields = date => ({
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
        });
        return [
            dateFields(fields(start)),
            dateFields(fields(end))
        ];
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

export default function parseISO (iso) {
    iso = iso || '';
    const parser = findParser(iso);
    if (!parser) {
        throw new CartoParsingError(`No date parser found for ${iso}`);
    }
    return parser.parse(iso);
}
