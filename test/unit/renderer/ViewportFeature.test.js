import ViewportFeature from '../../../src/renderer/ViewportFeature';

describe('src/renderer/ViewportFeature', () => {
    const feature = {
        city: 'Murcia',
        status: 'Fluid'
    };

    const properties = ['city', 'status'];
    const viewportFeature = new ViewportFeature(feature, properties);

    describe('constructor', () => {
        it('should create a ViewportFeature object properly', () => {
            expect(viewportFeature._feature).toEqual(feature);
        });
    });

    describe('._setProperties', () => {
        it('should create a getter for each property', () => {
            expect(viewportFeature.city).toEqual('Murcia');
            expect(viewportFeature.status).toEqual('Fluid');
        });
    });
});
