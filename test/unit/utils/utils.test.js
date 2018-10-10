import * as util from '../../../src/utils/util';

function time (y, m = 1, d = 1, h = 0, min = 0, sec = 0) {
    return Date.UTC(y, m - 1, d, h, min, sec);
}

describe('utils/utils', () => {
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
