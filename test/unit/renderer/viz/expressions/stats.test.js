import { average, standardDeviation } from '../../../../../src/renderer/viz/expressions/stats';

describe('src/renderer/viz/expressions/stats', () => {
    const data = [0, 1, 1, 2, 3, 5, 8, 13];

    it('average', () => {
        expect(average(data)).toEqual(4.125);
    });

    it('standardDeviation', () => {
        expect(standardDeviation(data)).toEqual(4.136348026943574);
    });
});
