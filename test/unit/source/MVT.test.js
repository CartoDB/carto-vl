import MVT from '../../../src/sources/MVT';

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
});
