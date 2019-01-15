import Renderer from '../../../src/renderer/Renderer';
import { RTT_WIDTH, isBrowserSupported, unsupportedBrowserReasons } from '../../../src/renderer/Renderer';

describe('src/renderer/Renderer', () => {
    describe('WebGL errors', () => {
        const webGLWithNoExtensions = {
            getExtension: () => null,
            getParameter: () => RTT_WIDTH
        };
        const webGLWithInvalidParameter = {
            getExtension: () => ({}),
            getParameter: () => RTT_WIDTH - 1
        };
        const webGLWithNoExtensionsAndInvalidParameter = {
            getExtension: () => null,
            getParameter: () => RTT_WIDTH - 1
        };
        const webGLValidContext = {
            getExtension: () => ({}),
            getParameter: () => RTT_WIDTH
        };

        const canvasWithNoWebGL = { getContext: () => null };
        const canvasWithNoExtensions = {
            getContext: () => webGLWithNoExtensions
        };
        const canvasWithInvalidParameter = {
            getContext: () => webGLWithInvalidParameter
        };

        describe('Constructor', () => {
            it('should throw when there is no webgl context', () => {
                expect(() => {
                    new Renderer(canvasWithNoWebGL);
                }).toThrowError(/WebGL 1 is unsupported/);
            });

            it('should throw when the "OES_texture_float" extension is not available', () => {
                expect(() => {
                    new Renderer(canvasWithNoExtensions);
                }).toThrowError(/WebGL extension 'OES_texture_float' is unsupported/);
            });

            it('should throw when the "MAX_RENDERBUFFER_SIZE" parameter is not big enough', () => {
                expect(() => {
                    new Renderer(canvasWithInvalidParameter);
                }).toThrowError(/WebGL parameter 'gl\.MAX_RENDERBUFFER_SIZE' is below the requirement.*/);
            });
        });

        describe('initialize', () => {
            it('should throw when the "OES_texture_float" extension is not available', () => {
                expect(() => {
                    const renderer = new Renderer();
                    renderer.initialize(webGLWithNoExtensions);
                }).toThrowError(/WebGL extension 'OES_texture_float' is unsupported/);
            });

            it('should throw when the "MAX_RENDERBUFFER_SIZE" parameter is not big enough', () => {
                expect(() => {
                    const renderer = new Renderer();
                    renderer.initialize(webGLWithInvalidParameter);
                }).toThrowError(/WebGL parameter 'gl\.MAX_RENDERBUFFER_SIZE' is below the requirement.*/);
            });
        });

        describe('isBrowserSupported', () => {
            it('should return true for valid WebGL context', () => {
                expect(isBrowserSupported(null, webGLValidContext)).toBe(true);
            });

            const invalidWebGLContextScenarios = [
                webGLWithNoExtensions,
                webGLWithInvalidParameter,
                webGLWithNoExtensionsAndInvalidParameter
            ];
            invalidWebGLContextScenarios.forEach((ctx, i) => {
                it(`should return false for invalid WebGL context (${i})`, () => {
                    expect(isBrowserSupported(null, ctx)).toBe(false);
                });
            });

            it('should return false when WebGL is not available', () => {
                expect(isBrowserSupported(canvasWithNoWebGL)).toBe(false);
            });
        });

        describe('unsupportedBrowserReasons', () => {
            it('should return WebGL unavailable error', () => {
                const reasons = unsupportedBrowserReasons(canvasWithNoWebGL);
                expect(reasons.length).toBe(1);
                expect(reasons[0].message).toMatch(/WebGL 1 is unsupported/);
            });

            const invalidWebGLContextScenarios = [
                {
                    ctx: webGLWithNoExtensions,
                    errors: [
                        /WebGL extension 'OES_texture_float' is unsupported/
                    ]
                },
                {
                    ctx: webGLWithInvalidParameter,
                    errors: [
                        /WebGL parameter 'gl\.MAX_RENDERBUFFER_SIZE' is below the requirement.*/
                    ]
                },
                {
                    ctx: webGLWithNoExtensionsAndInvalidParameter,
                    errors: [
                        /WebGL extension 'OES_texture_float' is unsupported/,
                        /WebGL parameter 'gl\.MAX_RENDERBUFFER_SIZE' is below the requirement.*/
                    ]
                }
            ];
            invalidWebGLContextScenarios.forEach((scenario, i) => {
                it(`should return false for invalid WebGL context (${i})`, () => {
                    const reasons = unsupportedBrowserReasons(null, scenario.ctx);
                    expect(reasons.length).toBe(scenario.errors.length);
                    scenario.errors.forEach((errorRegex, i) => {
                        expect(reasons[i]).toMatch(errorRegex);
                    });
                });
            });
        });
    });
});
