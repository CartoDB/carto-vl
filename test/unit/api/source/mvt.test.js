import MVT from '../../../../src/api/source/mvt';

describe('api/source/mvt', () => {
    describe('constructor', () => {
        it('should check for invalid input parameterstemplate urls', () => {
            expect(function () {
                new MVT('http://www.example/mvt/{z}/{x}/{y}.mvt');
            }).toThrowError('`templateURL` property is not a valid URL.');
        });
    });
});
