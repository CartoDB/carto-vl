import * as s from '../../../../../src/core/viz/functions';
import { Torque } from '../../../../../src/core/viz/expressions/torque';

describe('src/core/viz/expressions/torque', () => {
    describe('constructor with valid inputs', () => {
        it('should return valid Torque instances', () => {
            expect(s.torque(0.5) instanceof Torque).toBeTruthy();
            expect(s.torque(0.5, 21) instanceof Torque).toBeTruthy();
            expect(s.torque(0.5, 21, s.fade(1, 1)) instanceof Torque).toBeTruthy();
        });
        describe('constructor with invalid inputs', () => {
            it('should throw with categorical inputs', () => {
                expect(() => s.torque('cat')._compile()).toThrow();
            });
            it('should throw with a float duration', () => {
                expect(() => s.torque(5, s.number(10))._compile()).toThrow();
            });
            it('should throw with a float fade', () => {
                expect(() => s.torque(5, 10, s.number(10))._compile()).toThrow();
            });
        });
        describe('.eval()', () => {
            it('should eval to 0 when the input is 1', () => {
                expect(s.torque(1).eval()).toEqual(0);
            });
            it('should eval close to 1 when the input is 0 and the fading is high', () => {
                const t = s.torque(0, 10, s.fade(10));
                t._setTimestamp(0);
                expect(t.eval()).toEqual(1);
            });
            it('should eval close to 0.75 when the input is 0 and we have wait a quarter of the animation', () => {
                const t = s.torque(0, 1, s.fade(1));
                t._setTimestamp(0.25);
                expect(t.eval()).toEqual(0.75);
            });
        });
    });
});
