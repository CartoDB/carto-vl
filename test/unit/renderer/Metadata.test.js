import Metadata from '../../../src/renderer/Metadata';

describe('src/renderer/Metadata', () => {
    const METADATA = new Metadata({
        properties: {
            city: {
                type: 'category',
                categories: [
                    { name: 'Murcia' }, 
                    { name: 'Pontevedra' },
                    { name: 'Madrid' }
                ]
            },

            status: {
                type: 'category',
                categories: [
                    { name: 'Fluid' },
                    { name: 'Slow' }
                ],
                aggregations: {
                    foo: () => { return 1; },
                    bar: () => { return 2; }
                }
            }
        }
    });

    const metadata = new Metadata(METADATA);

    describe('constructor', () => {
        it('should create a Metadata object properly', () => {
            expect(metadata.idProperty).toEqual('cartodb_id');
            expect(metadata.IDToCategory.size).toEqual(5);
            expect(metadata.categoryToID.size).toEqual(5);
            expect(metadata.numCategories).toEqual(5);
        });
    });

    describe('.propertyNames', () => {
        describe('when there are no aggregations', () => {
            it('should return an array with the property name as the only element', () => {
                const propertyNames = metadata.propertyNames('city');
                expect(propertyNames[0]).toEqual('city');
            });
        });

        describe('when there are aggregations', () => {
            it('should return an array with the property name as the only element', () => {
                const propertyNames = metadata.propertyNames('status');
                expect(propertyNames.length).toEqual(2);
                expect(propertyNames[0]()).toEqual(1);
                expect(propertyNames[1]()).toEqual(2);
            });
        });
    });
});
