import MVT from '../../../src/sources/MVT';
import { MVTWorker } from '../../../src/sources/MVTWorker';

describe('sources/MVT', () => {
    describe('constructor', () => {
        const metadata = {
            idProperty: 'id',
            properties: {}
        };
        const layerId = 'layer0';
        const maxZoom = 14;

        it('should have viewportZoomToSourceZoom when no options are provided', () => {
            const source = new MVT('URL', metadata);
            expect(source._options.viewportZoomToSourceZoom).not.toBeUndefined();
        });

        it('should have viewportZoomToSourceZoom when layerId option is present but viewportZoomToSourceZoom is not', () => {
            const source = new MVT('URL', metadata, { layerId });
            expect(source._options.viewportZoomToSourceZoom).not.toBeUndefined();
        });

        it('should have viewportZoomToSourceZoom when layerId and maxZoom option is present but viewportZoomToSourceZoom is not', () => {
            const source = new MVT('URL', metadata, { layerId, maxZoom });
            expect(source._options.viewportZoomToSourceZoom).not.toBeUndefined();
        });

        it('should have viewportZoomToSourceZoom as provided', () => {
            const viewportZoomToSourceZoom = z => z;
            const source = new MVT('URL', metadata, { viewportZoomToSourceZoom });
            expect(source._options.viewportZoomToSourceZoom).not.toBeUndefined();
            expect(source._options.viewportZoomToSourceZoom).toEqual(viewportZoomToSourceZoom);
        });
    });
    describe('decodeProperty', () => {
        it('should throw an error when the property type is string and the metadata declared type is number', () => {
            const metadata = {
                idProperty: 'id',
                properties: {
                    wadus: {
                        type: 'number'
                    }
                }
            };
            const worker = new MVTWorker();
            expect(() => {
                worker.decodeProperty(metadata, 'wadus', 'this is not a number');
            }).toThrowError(/MVT decoding error. Metadata property \'wadus\' is of type \'number\' but the MVT tile contained a feature property of type string: \'this is not a number\'/);
        });
        it('should throw an error when the property type is number and the metadata declared type is category', () => {
            const metadata = {
                idProperty: 'id',
                properties: {
                    wadus: {
                        type: 'category'
                    }
                }
            };
            const worker = new MVTWorker();
            expect(() => {
                worker.decodeProperty(metadata, 'wadus', 123);
            }).toThrowError(/MVT decoding error. Metadata property \'wadus\' is of type \'category\' but the MVT tile contained a feature property of type number: \'123\'/);
        });
    });
});
