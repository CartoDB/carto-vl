import LayerConcurrencyHelper from '../../src/LayerConcurrencyHelper';
import CartoRuntimeError from '../../src/errors/carto-runtime-error';

describe('LayerConcurrencyHelper', () => {
    it('should allow sequential init & end of major and minor changes', () => {
        const helper = new LayerConcurrencyHelper();

        let majorChange = helper.initMajorChange();
        expect(majorChange).toEqual({ major: 0, minor: 0 });
        helper.endMajorChange(majorChange);

        let minorChange = helper.initMinorChange();
        expect(minorChange).toEqual({ major: 0, minor: 1 });
        helper.endMinorChange(minorChange);
    });

    describe('detectConcurrentChanges', () => {
        it('should block 2 concurrent major changes', () => {
            const helper = new LayerConcurrencyHelper();

            let change1 = helper.initMajorChange();
            let change2 = helper.initMajorChange(); // from a theorical concurrent update
            helper.endMajorChange(change2); // it doesn't raise an error...

            expect(() => {
                helper.endMajorChange(change1); // ...but this it does!
            }).toThrowError(CartoRuntimeError);
        });

        it('should block 2 concurrent changes: 1 major vs 1 minor', () => {
            const helper = new LayerConcurrencyHelper();

            let change1 = helper.initMinorChange();
            let change2 = helper.initMajorChange();
            helper.endMajorChange(change2);

            expect(() => {
                helper.endMinorChange(change1);
            }).toThrowError(CartoRuntimeError);
        });

        it('should block 2 concurrent changes: 1 minor vs 1 minor', () => {
            const helper = new LayerConcurrencyHelper();

            let change1 = helper.initMinorChange();
            let change2 = helper.initMinorChange();
            helper.endMinorChange(change2);

            expect(() => {
                helper.endMinorChange(change1);
            }).toThrowError(CartoRuntimeError);
        });
    });
});
