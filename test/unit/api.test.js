import carto from '../../src/index';
import { version } from '../../package.json';

describe('api', () => {
    it('should exist `version`', () => {
        expect(carto.version).toBeDefined();
        expect(carto.version).toBe(version);
    });

    it('should exist `setDefaultAuth`', () => {
        expect(carto.setDefaultAuth).toBeDefined();
    });

    it('should exist `setDefaultConfig`', () => {
        expect(carto.setDefaultConfig).toBeDefined();
    });

    it('should exist `source`', () => {
        expect(carto.source).toBeDefined();
        expect(carto.source.Dataset).toBeDefined();
        expect(carto.source.SQL).toBeDefined();
        expect(carto.source.GeoJSON).toBeDefined();
        expect(carto.source.MVT).toBeDefined();
    });

    it('should exist `expressions`', () => {
        expect(carto.expressions).toBeDefined();
    });

    it('should exist `Layer`', () => {
        expect(carto.Layer).toBeDefined();
    });

    it('should exist `Viz`', () => {
        expect(carto.Viz).toBeDefined();
    });

    it('should exist `Interactivity`', () => {
        expect(carto.Interactivity).toBeDefined();
    });
});
