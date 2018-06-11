import * as s from '../../../../../src/core/viz/functions';
import { validateTypeErrors, validateStaticType, validateFeatureDependentErrors } from './utils';

describe('src/core/viz/expressions/torque', () => {
    describe('error control', () => {
        validateFeatureDependentErrors('torque', [0.5, 'dependent']);
        validateTypeErrors('torque', ['category', 10]);
        validateTypeErrors('torque', ['number', 10, 'color']);
        validateTypeErrors('torque', ['color', 10]);
        validateTypeErrors('torque', ['number', 'color']);
    });
    describe('type', () => {
        validateStaticType('torque', ['number'], 'number');
        validateStaticType('torque', ['number', 10], 'number');
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
