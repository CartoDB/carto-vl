import Metadata from '../../../src/renderer/Metadata';
import Renderer from '../../../src/renderer/Renderer';

describe('src/renderer/Renderer', () => {
    describe('._featureFromDataFrame', () => {
        const renderer = new Renderer();
    
        it('should return a proper feature for category values', () => {
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

            const dataframe = {
                properties: {
                    city: [0],
                    status: [0]
                }
            };

            const feature = renderer._featureFromDataFrame(dataframe, 0, METADATA);

            expect(feature).toEqual({ city: 'Murcia', status: 'Fluid' });
        });

        it('should return a proper feature for numeric values', () => {
            const METADATA = new Metadata({
                properties: {        
                    status: {
                        type: 'number',
                        min: 1,
                        max: 100
                    }
                }
            });

            const dataframe = {
                properties: {
                    status: [0]
                }
            };

            const feature = renderer._featureFromDataFrame(dataframe, 0, METADATA);

            expect(feature).toEqual({ status: 0 });
        });
    });
});
