import MVT from '../../../src/sources/MVT';
import MVTMetadata from '../../../src/sources/MVTMetadata';
import { FP32_DESIGNATED_NULL_VALUE } from '../../../src/renderer/viz/expressions/constants';

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
    describe('MVT Codecs', () => {
        it('should throw an error when the property type is string and the metadata declared type is number', () => {
            const metadata = new MVTMetadata({
                properties: {
                    wadus: {
                        type: 'number'
                    }
                },
                idProperty: 'id'
            });
            metadata.setCodecs();
            expect(() => {
                metadata.codec('wadus').sourceToInternal(metadata, 'this is not a number');
            }).toThrowError(/MVT decoding error. Metadata property is of type \'number\' but the MVT tile contained a feature property of type 'string': \'this is not a number\'/);
        });
        it('should throw an error when the property type is number and the metadata declared type is category', () => {
            const metadata = new MVTMetadata({
                properties: {
                    wadus: {
                        type: 'category'
                    }
                },
                idProperty: 'id'
            });
            metadata.setCodecs();
            expect(() => {
                metadata.codec('wadus').sourceToInternal(metadata, 123);
            }).toThrowError(/MVT decoding error. Metadata property is of type \'category\' but the MVT tile contained a feature property of type 'number': \'123\'/);
        });
        it('Category property should work with undefined value', () => {
            const metadata = new MVTMetadata({
                properties: {
                    wadus: {
                        type: 'category'
                    }
                },
                idProperty: 'id'
            });
            metadata.setCodecs();
            expect(metadata.codec('wadus').sourceToInternal(metadata, undefined)).toEqual(FP32_DESIGNATED_NULL_VALUE);
        });
        it('Category property should work with null value', () => {
            const metadata = new MVTMetadata({
                properties: {
                    wadus: {
                        type: 'category'
                    }
                },
                idProperty: 'id'
            });
            metadata.setCodecs();
            expect(metadata.codec('wadus').sourceToInternal(metadata, null)).toEqual(FP32_DESIGNATED_NULL_VALUE);
        });
        it('should throw an error when the property type is number and the metadata declared type is category', () => {
            const metadata = new MVTMetadata({
                properties: {
                    wadus: {
                        type: 'category'
                    }
                },
                idProperty: 'id'
            });
            metadata.setCodecs();
            expect(() => {
                metadata.codec('wadus').sourceToInternal(metadata, 0);
            }).toThrowError(/MVT decoding error. Metadata property is of type \'category\' but the MVT tile contained a feature property of type 'number': \'0\'/);
        });
        it('Number property should work with null value', () => {
            const metadata = new MVTMetadata({
                properties: {
                    wadus: {
                        type: 'number'
                    }
                },
                idProperty: 'id'
            });
            metadata.setCodecs();
            expect(metadata.codec('wadus').sourceToInternal(metadata, null)).toEqual(FP32_DESIGNATED_NULL_VALUE);
        });
        it('Number property should work with undefined value', () => {
            const metadata = new MVTMetadata({
                properties: {
                    wadus: {
                        type: 'number'
                    }
                },
                idProperty: 'id'
            });
            metadata.setCodecs();
            expect(metadata.codec('wadus').sourceToInternal(metadata, undefined)).toEqual(FP32_DESIGNATED_NULL_VALUE);
        });
        it('Number property should properly handle 0 value', () => {
            const metadata = new MVTMetadata({
                properties: {
                    wadus: {
                        type: 'number'
                    }
                },
                idProperty: 'id'
            });
            metadata.setCodecs();
            expect(metadata.codec('wadus').sourceToInternal(metadata, 0)).toEqual(0);
        });
    });
});
