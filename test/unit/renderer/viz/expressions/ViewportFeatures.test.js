import ViewportFeatures from '../../../../../src/renderer/viz/expressions/ViewportFeatures';
import ViewportFeature from '../../../../../src/renderer/ViewportFeature';
import { property } from '../../../../../src/renderer/viz/expressions';

describe('src/renderer/viz/expressions/viewportFeatures', () => {
    describe('._compile', () => {
        it('should throw an error if it is called', (done) => {
            const viewportFeatures = new ViewportFeatures();

            try {
                viewportFeatures._compile();
            } catch (err) {
                expect(err.message).toEqual('viewportFeatures cannot be used in visualizations');
                done();
            }
        });
    });

    describe('resetViewportAgg', () => {
        it('should throw an error if properties are not valid Property', (done) => {
            const properties = [];
            properties.push('city');
            properties.push('status');

            const viewportFeatures = new ViewportFeatures(...properties);

            try {
                viewportFeatures.resetViewportAgg();
            } catch (err) {
                expect(err.message).toEqual('viewportFeatures arguments can only be properties');
                done();
            }
        });

        it('should set _ViewportFeatureProxy if it is not present', () => {
            const properties = [];
            properties.push(property('city'));
            properties.push(property('status'));

            const viewportFeatures = new ViewportFeatures(...properties);
            viewportFeatures.resetViewportAgg();
           
            expect(viewportFeatures._ViewportFeatureProxy).toBeDefined();
        });

        it('should create the feature proxy with the given properties', () => {
            const properties = [];
            properties.push(property('city'));
            properties.push(property('status'));

            const viewportFeatures = new ViewportFeatures(...properties);
            viewportFeatures.resetViewportAgg();
            viewportFeatures.accumViewportAgg({ city: 'Murcia' });
           
            expect(viewportFeatures.expr[0] instanceof ViewportFeature).toBeTruthy();
            expect(viewportFeatures.expr[0].city).toEqual('Murcia');

            viewportFeatures.accumViewportAgg({ city: 'Pontevedra' });
            expect(viewportFeatures.expr[1] instanceof ViewportFeature).toBeTruthy();
            expect(viewportFeatures.expr[1].city).toEqual('Pontevedra');
        });
    });
});
