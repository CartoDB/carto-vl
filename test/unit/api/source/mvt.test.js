import MVT from '../../../../src/api/source/mvt';

describe('api/source/mvt', () => {
    describe('constructor', () => {
        it('should build a new Source passing a MVT url', () => {
            const metadata = { columns: [{ type: 'number', name: 'test_col' }] };
            const source = new MVT('http://www.example.com/mvt/{z}/{x}/{y}.mvt', metadata);
            expect(source._templateURL).toEqual('http://www.example.com/mvt/{z}/{x}/{y}.mvt');
            expect(source.metadata).toBeDefined();
            expect(source.metadata.columns).toEqual([{ type: 'number', name: 'test_col' }]);
        });
        it('should build a new Source passing a MVT url and multiple column types', () => {
            const metadata = { columns: [{ type: 'number', name: 'test_col' }, { type: 'category', name: 'cat_col' }] };
            const source = new MVT('http://www.example.com/mvt/{z}/{x}/{y}.mvt', metadata);
            expect(source._templateURL).toEqual('http://www.example.com/mvt/{z}/{x}/{y}.mvt');
            expect(source.metadata).toBeDefined();
            expect(source.metadata.columns).toEqual(metadata.columns);
        });
        it('should check for invalid input parameterstemplate urls', () => {
            const metadata = { columns: [{ type: 'number', name: 'test_col' }] };
            expect(function () {
                new MVT('http://www.example/mvt/{z}/{x}/{y}.mvt', metadata);
            }).toThrowError('`templateURL` property is not a valid URL.');
            expect(function () {
                new MVT('http://www.example.com/mvt/{z}/{x}/{y}.mvt');
            }).toThrowError('`metadata` property is required for MVT source.');
        });
    });
});
