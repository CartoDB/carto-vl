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

export default function parseISO (iso, next = false) {
    iso = iso || '';
    const parser = findParser(iso);
    if (!parser) {
        throw new Error(`No date parser found for ${iso}`);
    }
    return parser.parse(iso, next);
}
