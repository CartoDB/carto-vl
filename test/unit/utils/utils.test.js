import * as util from '../../../src/utils/util';

function time (y, m = 1, d = 1, h = 0, min = 0, sec = 0) {
    return Date.UTC(y, m - 1, d, h, min, sec);
}

describe('utils/utils start/endTimeValue', () => {
    it('should compute correct year start time', () => {
        expect(util.startTimeValue('2017')).toEqual(time(2017));
    });

    it('should compute correct year end time', () => {
        expect(util.endTimeValue('2017')).toEqual(time(2018));
    });

    it('should compute correct month start time', () => {
        expect(util.startTimeValue('2017-12')).toEqual(time(2017, 12));
    });

    it('should compute correct month end time', () => {
        expect(util.endTimeValue('2017-12')).toEqual(time(2018));
    });

    it('should compute correct day start time', () => {
        expect(util.startTimeValue('2017-12-31')).toEqual(time(2017, 12, 31));
    });

    it('should compute correct day end time', () => {
        expect(util.endTimeValue('2017-12-31')).toEqual(time(2018, 1, 1));
    });

    it('should compute correct hour start time', () => {
        expect(util.startTimeValue('2017-12-07T23')).toEqual(time(2017, 12, 7, 23));
    });

    it('should compute correct hour end time', () => {
        expect(util.endTimeValue('2017-12-07T23')).toEqual(time(2017, 12, 8, 0));
    });

    it('should compute correct minute start time', () => {
        expect(util.startTimeValue('2017-12-07T23:59')).toEqual(time(2017, 12, 7, 23, 59));
    });

    it('should compute correct minute end time', () => {
        expect(util.endTimeValue('2017-12-07T23:59')).toEqual(time(2017, 12, 8));
    });

    it('should compute correct second start time', () => {
        expect(util.startTimeValue('2017-12-07T23:59:58')).toEqual(time(2017, 12, 7, 23, 59, 58));
    });

    it('should compute correct second end time', () => {
        expect(util.endTimeValue('2017-12-07T23:59:58')).toEqual(time(2017, 12, 7, 23, 59, 59));
    });

    it('should compute correct quarter start time', () => {
        expect(util.startTimeValue('2017Q1')).toEqual(time(2017, 1));
        expect(util.startTimeValue('2017Q2')).toEqual(time(2017, 4));
        expect(util.startTimeValue('2017Q3')).toEqual(time(2017, 7));
        expect(util.startTimeValue('2017Q4')).toEqual(time(2017, 10));
    });

    it('should compute correct quarter end time', () => {
        expect(util.endTimeValue('2017Q1')).toEqual(time(2017, 4));
        expect(util.endTimeValue('2017Q2')).toEqual(time(2017, 7));
        expect(util.endTimeValue('2017Q3')).toEqual(time(2017, 10));
        expect(util.endTimeValue('2017Q4')).toEqual(time(2018));
    });

    it('should compute correct week start time', () => {
        expect(util.startTimeValue('2017W05')).toEqual(time(2017, 1, 30));
        expect(util.startTimeValue('2013W15')).toEqual(time(2013, 4, 8));
        expect(util.startTimeValue('2009W53')).toEqual(time(2009, 12, 28));
        expect(util.startTimeValue('2010W01')).toEqual(time(2010, 1, 4));
        expect(util.startTimeValue('2011W52')).toEqual(time(2011, 12, 26));
        expect(util.startTimeValue('2012W01')).toEqual(time(2012, 1, 2));
        expect(util.startTimeValue('2014W01')).toEqual(time(2013, 12, 30));
        expect(util.startTimeValue('2014W02')).toEqual(time(2014, 1, 6));
    });

    it('should compute correct week end time', () => {
        expect(util.endTimeValue('2017W05')).toEqual(time(2017, 2, 6));
        expect(util.endTimeValue('2013W15')).toEqual(time(2013, 4, 15));
        expect(util.endTimeValue('2009W53')).toEqual(time(2010, 1, 4));
        expect(util.endTimeValue('2010W01')).toEqual(time(2010, 1, 11));
        expect(util.endTimeValue('2011W52')).toEqual(time(2012, 1, 2));
        expect(util.endTimeValue('2012W01')).toEqual(time(2012, 1, 9));
        expect(util.endTimeValue('2014W01')).toEqual(time(2014, 1, 6));
        expect(util.endTimeValue('2014W02')).toEqual(time(2014, 1, 13));
    });

    it('should compute correct century start time', () => {
        expect(util.startTimeValue('C20')).toEqual(time(1901));
    });

    it('should compute correct century end time', () => {
        expect(util.endTimeValue('C20')).toEqual(time(2001));
    });

    it('should compute correct decade start time', () => {
        expect(util.startTimeValue('D201')).toEqual(time(2010));
    });

    it('should compute correct decade end time', () => {
        expect(util.endTimeValue('D201')).toEqual(time(2020));
    });

    it('should compute correct millennium start time', () => {
        expect(util.startTimeValue('M3')).toEqual(time(2001));
    });

    it('should compute correct millennium end time', () => {
        expect(util.endTimeValue('M3')).toEqual(time(3001));
    });

    it('should compute correct default start times', () => {
        expect(util.startTimeValue('0001')).toEqual(time(1));
        expect(util.startTimeValue('0001-01')).toEqual(time(1));
        expect(util.startTimeValue('0001-01-01')).toEqual(time(1));
        expect(util.startTimeValue('0001-01-01T00')).toEqual(time(1));
        expect(util.startTimeValue('0001-01-01T00:00')).toEqual(time(1));
        expect(util.startTimeValue('0001-01-01T00:00:00')).toEqual(time(1));
    });

    it('should compute correct default end times', () => {
        expect(util.endTimeValue('0001')).toEqual(time(2));
        expect(util.endTimeValue('0001-01')).toEqual(time(1, 2));
        expect(util.endTimeValue('0001-01-01')).toEqual(time(1, 1, 2));
        expect(util.endTimeValue('0001-01-01T00')).toEqual(time(1, 1, 1, 1));
        expect(util.endTimeValue('0001-01-01T00:00')).toEqual(time(1, 1, 1, 0, 1));
        expect(util.endTimeValue('0001-01-01T00:00:00')).toEqual(time(1, 1, 1, 0, 0, 1));
    });
});

describe('utils/utils periodISO', () => {
    it('should compute correct year', () => {
        expect(util.periodISO(time(2017), time(2018))).toEqual('2017');
    });
    it('should compute correct month', () => {
        expect(util.periodISO(time(2017, 12), time(2018, 1))).toEqual('2017-12');
        expect(util.periodISO(time(2017, 1), time(2017, 2))).toEqual('2017-01');
    });
    it('should compute correct day', () => {
        expect(util.periodISO(time(2017, 12, 1), time(2017, 12, 2))).toEqual('2017-12-01');
        expect(util.periodISO(time(2017, 12, 31), time(2018))).toEqual('2017-12-31');
        expect(util.periodISO(time(2017, 11, 30), time(2017, 12))).toEqual('2017-11-30');
    });
    it('should compute correct week', () => {
        expect(util.periodISO(time(2017, 1, 30), time(2017, 2, 6))).toEqual('2017-W05');
        expect(util.periodISO(time(2013, 4, 8), time(2013, 4, 15))).toEqual('2013-W15');
        expect(util.periodISO(time(2009, 12, 28), time(2010, 1, 4))).toEqual('2009-W53');
        expect(util.periodISO(time(2010, 1, 4), time(2010, 1, 11))).toEqual('2010-W01');
        expect(util.periodISO(time(2011, 12, 26), time(2012, 1, 2))).toEqual('2011-W52');
        expect(util.periodISO(time(2012, 1, 2), time(2012, 1, 9))).toEqual('2012-W01');
        expect(util.periodISO(time(2013, 12, 30), time(2014, 1, 6))).toEqual('2014-W01');
        expect(util.periodISO(time(2014, 1, 6), time(2014, 1, 13))).toEqual('2014-W02');
    });
    it('should compute correct quarter', () => {
        expect(util.periodISO(time(2017, 1), time(2017, 4))).toEqual('2017-Q1');
        expect(util.periodISO(time(2017, 4), time(2017, 7))).toEqual('2017-Q2');
        expect(util.periodISO(time(2017, 7), time(2017, 10))).toEqual('2017-Q3');
        expect(util.periodISO(time(2017, 10), time(2018))).toEqual('2017-Q4');
    });
    it('should compute correct hour', () => {
        expect(util.periodISO(time(2017, 12, 1, 3), time(2017, 12, 1, 4))).toEqual('2017-12-01T03');
        expect(util.periodISO(time(2017, 12, 1, 23), time(2017, 12, 2, 0))).toEqual('2017-12-01T23');
        expect(util.periodISO(time(2017, 12, 1, 0), time(2017, 12, 1, 1))).toEqual('2017-12-01T00');
        expect(util.periodISO(time(2017, 12, 31, 23), time(2018))).toEqual('2017-12-31T23');
    });
    it('should compute correct minute', () => {
        expect(util.periodISO(time(2017, 12, 1, 3, 2), time(2017, 12, 1, 3, 3))).toEqual('2017-12-01T03:02');
    });
    it('should compute correct century', () => {
        expect(util.periodISO(time(2001), time(2101))).toEqual('C21');
        expect(util.periodISO(time(1901), time(2001))).toEqual('C20');
        expect(util.periodISO(time(1801), time(1901))).toEqual('C19');
    });
    it('should compute correct millennium', () => {
        expect(util.periodISO(time(2001), time(3001))).toEqual('M3');
        expect(util.periodISO(time(1001), time(2001))).toEqual('M2');
    });
    it('should compute correct decade', () => {
        expect(util.periodISO(time(2000), time(2010))).toEqual('D200');
        expect(util.periodISO(time(2010), time(2020))).toEqual('D201');
    });
});
