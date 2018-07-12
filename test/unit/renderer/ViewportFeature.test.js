import ViewportFeature from '../../../src/renderer/ViewportFeature';

export default class ViewportFeature {
    constructor(feature, properties) {
        this._feature = feature;
        this._setProperties(properties);
    }

    _setProperties(properties) {
        properties.forEach((name) => {
            Object.defineProperty(this, name, {
                get: () => this._feature[name]
            });
        });
    }
}


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
