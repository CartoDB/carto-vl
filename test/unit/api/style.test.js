import Style from '../../../src/api/style';
import { Style as InternalStyle } from '../../../src/core/style/index';

xdescribe('Style', () => {
    describe('constructor', () => {
        describe('when parameter is a string', () => {
            it('should return a valid style when string parameter is well formed', () => {
                const styleString = 'color: rgba(0, 0, 0, 0)';
                const actual = new Style(styleString);
                expect(actual).toEqual(jasmine.any(InternalStyle));
            });

        });
        describe('should build an style from an object', () => {

        });
    });
});



