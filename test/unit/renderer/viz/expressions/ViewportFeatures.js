import Metadata from '../../../../../src/renderer/Metadata';
import ViewportFeatures from '../../../../../src/renderer/viz/expressions/ViewportFeatures';

describe('src/renderer/viz/expressions/viewportFeatures', () => {
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
                ]
            }
        }
    });

    const properties = Object.keys(METADATA.properties);

    const viewportFeatures = new ViewportFeatures(properties);

    describe('._compile', () => {
        it('should throw an error if it is called', (done) => {
            try {
                viewportFeatures._compile();
            } catch (err) {
                expect(err).toEqual('viewportFeatures cannot be used in visualizations');
                done();
            }
        });
    });
});
