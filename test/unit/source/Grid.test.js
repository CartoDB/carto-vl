import Grid from '../../../src/sources/Grid';

describe('sources/Grid', () => {
    const urlGeotiff = 'http://127.0.0.1:8080/examples/raster/small_3857.tiff';

    fdescribe('constructor', () => {
        it('should build a new Source with an URL', async () => {
            const source = new Grid(urlGeotiff);
            await source.initializationPromise;

            expect(source._grid).toBeTruthy();
        });

        it('should get center from new Source', async () => {
            const source = new Grid(urlGeotiff);
            await source.initializationPromise;

            expect(source._center.x).toBe(-419334.36645);
            expect(source._center.y).toBe(5382692.45555);

            expect(source._dataframeCenter.x).toBe(-0.020927470585478402);
            expect(source._dataframeCenter.y).toBe(0.26863082791863346);
        });

    // it('should compute the center of the coordinates', () => {
    //     const source = new GeoJSON(urlGeotiff);
    //     expect(source._dataframeCenter).toBeDefined();
    //     expect(source._dataframeCenter.x).toBeCloseTo(0.0555);
    //     expect(source._dataframeCenter.x).toBeCloseTo(0.0567);
    // });
    });
});
