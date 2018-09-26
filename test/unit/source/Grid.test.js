import Grid from '../../../src/sources/Grid';
import Viz from '../../../src/Viz';

fdescribe('sources/Grid', () => {
    const urlGeotiff = 'http://127.0.0.1:8080/examples/raster/small_3857.tiff';

    describe('constructor', () => {
        it('should build a new Source with an URL', async () => {
            const source = new Grid(urlGeotiff);
            await source.initializationPromise;

            expect(source._grid).toBeTruthy();
        });

        it('should get center from new Source', async () => {
            const source = new Grid(urlGeotiff);
            await source.initializationPromise;

            expect(source._center).toBeDefined();
            expect(source._center.x).toBe(-419334.36645);
            expect(source._center.y).toBe(5382692.45555);

            expect(source._dataframeCenter).toBeDefined();
            expect(source._dataframeCenter.x).toBe(-0.020927470585478402);
            expect(source._dataframeCenter.y).toBe(0.26863082791863346);
        });
    });

    describe('dataframe', () => {
        it('should build a DataFrame with one property per band', async () => {
            const source = new Grid(urlGeotiff);
            await source.initializationPromise;

            const dataframe = source._buildDataFrame();

            expect(dataframe).toBeTruthy();
            expect(dataframe.properties['band0']).toBeTruthy();
            expect(dataframe.properties['band0'][0]).toBe(0.011275325901806355); // first pixel
        });

        it('should build Metadata from a viz', async () => {
            const source = new Grid(urlGeotiff);
            await source.initializationPromise;

            const metadata = source._computeMetadata(new Viz());
            expect(source._metadata).toBe(metadata);

            expect(metadata).toBeTruthy();
            expect(metadata.properties['band0']).toBeTruthy();
            expect(metadata.properties['band0'].type).toBe('grid');
        });
    });
});
