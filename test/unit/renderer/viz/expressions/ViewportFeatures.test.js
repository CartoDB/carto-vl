import ViewportFeatures from '../../../../../src/renderer/viz/expressions/ViewportFeatures';

describe('src/renderer/viz/expressions/viewportFeatures', () => {
    describe('._compile', () => {
        it('should throw an error if it is called', () => {
            const viewportFeatures = new ViewportFeatures();

            expect(() => {
                viewportFeatures._compile();
            }).toThrowError('viewportFeatures cannot be used in visualizations');
        });
    });

    describe('_resetViewportAgg', () => {
        it('should throw an error if properties are not valid Property', () => {
            const properties = [];
            properties.push('city');
            properties.push('status');
            const viewportFeatures = new ViewportFeatures(...properties);

            expect(() => {
                viewportFeatures._resetViewportAgg();
            }).toThrowError('viewportFeatures arguments can only be properties');

        });

        it('should reset the viewport aggregation', () => {
            const viewportFeatures = new ViewportFeatures();
            viewportFeatures.accumViewportAgg({ city: 'Murcia' });

            viewportFeatures._resetViewportAgg();

            expect(viewportFeatures.value).toEqual([]);
        });
    });

    it('should return the list of current properties', () => {
        const viewportFeatures = new ViewportFeatures();

        viewportFeatures.accumViewportAgg({ city: 'Murcia' });

        expect(viewportFeatures.value[0].city).toEqual('Murcia');
    });
});
