import Grid from '../../../src/sources/Grid';

describe('sources/Grid', () => {
    const urlGeotiff = 'http://127.0.0.1:8080/examples/raster/small_3857.tiff';

    describe('constructor', () => {
        fit('should build a new Source with an URL', () => {
            const source = new Grid(urlGeotiff);
            console.log(source.lib);
            // await source.initializationPromise;

            expect(source).toEqual({});
        });

    // it('should compute the center of the coordinates', () => {
    //     const source = new GeoJSON(urlGeotiff);
    //     expect(source._dataframeCenter).toBeDefined();
    //     expect(source._dataframeCenter.x).toBeCloseTo(0.0555);
    //     expect(source._dataframeCenter.x).toBeCloseTo(0.0567);
    // });
    });
});
