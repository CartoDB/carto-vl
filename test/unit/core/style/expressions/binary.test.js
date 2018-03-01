import * as s from '../../../../../src/core/style/functions';

describe('src/core/style/expressions/binary', () => {
    describe('and', () => {
        it('should return 1 when both parameters are True', () => {
            const op = s.and(s.TRUE, s.TRUE);
            expect(op.eval()).toEqual(1);
        });
        it('should return 0 when both parameters are False', () => {
            const op = s.and(s.FALSE, s.FALSE);
            expect(op.eval()).toEqual(0);
        });
        it('should return 0.5 with 0.5 and TRUE', () => {
            const op = s.and(0.5, s.TRUE);
            expect(op.eval()).toEqual(0.5);
        });
        it('should return 0.25 with 0.5 and 0.5', () => {
            const op = s.and(0.5, 0.5);
            expect(op.eval()).toEqual(0.25);
        });
    });
});