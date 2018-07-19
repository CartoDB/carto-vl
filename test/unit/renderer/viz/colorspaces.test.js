import { cielabToSRGB, sRGBToCielab } from '../../../../src/renderer/viz/colorspaces';

describe('src/renderer/viz/colorspaces', () => {
    it('cielabToSRGB(sRGBToCielab(color)) must equal color', () => {
        const color = { r: 0.8, g: 0.6, b: 0.2, a: 0.8 };
        expect(cielabToSRGB(sRGBToCielab(color)).r).toBeCloseTo(color.r);
        expect(cielabToSRGB(sRGBToCielab(color)).g).toBeCloseTo(color.g);
        expect(cielabToSRGB(sRGBToCielab(color)).b).toBeCloseTo(color.b);
        expect(cielabToSRGB(sRGBToCielab(color)).a).toBeCloseTo(color.a);
    });
});
