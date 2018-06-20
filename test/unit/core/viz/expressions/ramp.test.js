import { validateStaticType, validateStaticTypeErrors, validateDynamicTypeErrors } from './utils';

import { ramp, buckets } from '../../../../../src/core/viz/functions';
import * as s from '../../../../../src/core/viz/functions';

describe('src/core/viz/expressions/ramp', () => {
    describe('error control', () => {
        validateStaticTypeErrors('ramp', []);
        validateStaticTypeErrors('ramp', ['number']);
        validateStaticTypeErrors('ramp', ['category']);
        validateDynamicTypeErrors('ramp', ['number', 'sprites']);
    });

    describe('type', () => {
        validateStaticType('ramp', ['number', 'palette'], 'color');
        validateStaticType('ramp', ['category', 'palette'], 'color');
        validateStaticType('ramp', ['category', 'color-array'], 'color');
        validateStaticType('ramp', ['category', 'number-array'], 'number');
        validateStaticType('ramp', ['category', 'sprites'], 'color');
    });

    describe('.eval', () => {
        describe('when palettes are color arrays', () => {
            describe('and values are numeric', () => {
                const values = [31, 57];
                let actual;
                let expected;

                it('should get the first value', () => {
                    const r = ramp(0, values);

                    r._compile();
                    actual = r.eval();
                    expected = values[0];

                    expect(actual).toEqual(expected);
                });

                it('should be able to get the second value', () => {
                    const r = ramp(1, values);

                    r._compile();
                    actual = r.eval();
                    expected = values[1];

                    expect(actual).toEqual(expected);
                });
            });

            describe('and values are colors', () => {
                const firstColor = s.namedColor('red');
                const secondColor = s.namedColor('blue');
                let actual;
                let expected;

                it('should get the first value', () => {
                    const r = ramp(0, [firstColor, secondColor]);

                    r._compile();
                    actual = r.eval();
                    expected = firstColor._nameToRGBA();

                    expect(actual).toEqual(expected);
                });

                it('should get the second value', () => {
                    const r = ramp(1, [firstColor, secondColor]);

                    r._compile();
                    actual = r.eval();
                    expected = secondColor._nameToRGBA();

                    expect(actual).toEqual(expected);
                });
            });
        });
    });

    describe('.eval with buckets', () => {
        const METADATA = {
            columns: [
                {
                    name: 'grade',
                    type: 'category',
                    categoryNames: [
                        'A',
                        'B',
                        'C',
                        'D',
                        'E'
                    ],
                },
            ],
            categoryIDs: {
                'A': 'A',
                'B': 'B',
                'C': 'C',
                'D': 'D',
                'E': 'E'
            }
        };

        describe('when palettes are color arrays', () => {
            const red = s.namedColor('red');
            const blue = s.namedColor('blue');
            const yellow = s.namedColor('yellow');
            const purple = s.namedColor('purple');
            const green = s.namedColor('green');
            const orange = s.namedColor('orange');

            let actual;
            let expected;

            describe('and there are less categories than colors', () => {
                describe('with "others"', () => {
                    it('should not show interpolation', () => {
                        const r = ramp(buckets('B', ['A', 'B', 'C']), [red, blue, yellow, purple]);

                        r._compile(METADATA);
                        actual = r.eval();
                        expected = blue._nameToRGBA();
        
                        expect(actual).toEqual(expected);
                    });

                    it('should use last color for "others"', () => {
                        const r = ramp(buckets('D', ['A', 'B', 'C']), [red, blue, yellow, purple]);

                        r._compile(METADATA);
                        actual = r.eval();
                        expected = purple._nameToRGBA();
        
                        expect(actual).toEqual(expected);
                    });
                });

                describe('without "others"', () => {
                    it('should show interpolation', () => {
                        const r = ramp(buckets('C', ['A', 'B', 'C', 'D', 'E']), [red, blue, yellow, purple, green, orange]);

                        r._compile(METADATA);
                        actual = r.eval();
                        expected = yellow._nameToRGBA();
        
                        expect(actual).not.toEqual(expected);
                    });
                });
            });

            describe('and there are the same categories than colors', () => {
                describe('with "others"', () => {
                    it('should not show interpolation', () => {
                        const categories = ['A', 'B', 'C', 'D'];
                        const colors = [red, blue, yellow, purple];
    
                        categories.forEach((category, index) => {
                            const r = ramp(buckets(category, categories), colors);
                            r._compile();
                            expect(r.eval()).toEqual(colors[index]._nameToRGBA());
                        });
                    });

                    it('should use the last color for the last category', () => {
                        const r = ramp(buckets('E', ['A', 'B', 'C']), [red, blue, purple]);
                        r._compile(METADATA);

                        actual = r.eval();
                        expected = r.defaultOtherColor._nameToRGBA();
        
                        expect(actual).toEqual(expected);
                    });

                    it('should use the default color for "others"', () => {
                        const r = ramp(buckets('D', ['A', 'B', 'C']), [red, blue, purple]);
                        r._compile(METADATA);

                        actual = r.eval();
                        expected = r.defaultOtherColor._nameToRGBA();
        
                        expect(actual).toEqual(expected);
                    });
                });

                describe('without "others"', () => {
                    it('should not show interpolation', () => {
                        const categories = ['A', 'B', 'C', 'D', 'E'];
                        const colors = [red, blue, yellow, purple, green];
    
                        categories.forEach((category, index) => {
                            const r = ramp(buckets(category, categories), colors);
                            r._compile();
                            expect(r.eval()).toEqual(colors[index]._nameToRGBA());
                        });
                    });
                });
            });

            describe('and there are the more categories than colors', () => {
                describe('with "others"', () => {
                    it('should show interpolation', () => {
                        const r = ramp(buckets('B', ['A', 'B', 'C', 'D']), [red, blue, purple]);

                        r._compile(METADATA);
                        actual = r.eval();
                        expected = blue._nameToRGBA();
        
                        expect(actual).not.toEqual(expected);
                    });

                    it('should use the last color for the last category', () => {
                        const r = ramp(buckets('D', ['A', 'B', 'C', 'D']), [red, blue, purple]);

                        r._compile(METADATA);
                        actual = r.eval();
                        expected = purple._nameToRGBA();
        
                        expect(actual).toEqual(expected);
                    });

                    it('should use the default color for others', () => {
                        const r = ramp(buckets('E', ['A', 'B', 'C', 'D']), [red, blue, purple]);

                        r._compile(METADATA);
                        actual = r.eval();
                        expected = r.defaultOtherColor._nameToRGBA();
        
                        expect(actual).toEqual(expected);
                    });
                });

                describe('without "others"', () => {
                    it('should show interpolation', () => {
                        const r = ramp(buckets('C', ['A', 'B', 'C', 'D', 'E']), [red, blue, purple]);

                        r._compile(METADATA);
                        actual = r.eval();
                        expected = blue._nameToRGBA();
        
                        expect(actual).not.toEqual(expected);
                    });

                    it('should use the last color for the last category', () => {
                        const r = ramp(buckets('E', ['A', 'B', 'C', 'D', 'E']), [red, blue, purple]);
                        
                        r._compile(METADATA);
                        actual = r.eval();
                        expected = purple._nameToRGBA();

                        expect(actual).toEqual(expected);
                    });
                });
            });
        });

        describe('when palettes are defined palettes', () => {
            describe('and palettes are qualitative', () => {
                describe('and there are less categories than colors', () => {
                    it('should not show interpolation', () => {
                        // TODO
                    });

                    it('should set the last color to "others"', () => {
                        // TODO
                    });
                });
    
                describe('and there are the same categories than colors', () => {
                    it('should not show interpolation', () => {
                        // TODO
                    });

                    it('should set the last color to "others"', () => {
                        // TODO
                    });
                });
    
                describe('and there are more categories than colors', () => {
                    it('should show interpolation', () => {
                        // TODO
                    });

                    it('should set the last color to "others"', () => {
                        // TODO
                    });
                });
            });

            describe('and palettes are quantitative', () => {
                describe('and there are less or equal than 7 categories', () => {
                    it('should not show interpolation', () => {
                        // TODO
                    });
                });
    
                describe('and there are more than 7 categories', () => {
                    it('should show interpolation', () => {
                        // TODO
                    });
                });
            });
        });
    });
});
