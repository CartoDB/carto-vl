import { validateStaticType, validateStaticTypeErrors, validateDynamicTypeErrors, checkRGBAThreshold } from './utils';
import * as cartocolor from 'cartocolor';
import { ramp, buckets, palettes, globalQuantiles } from '../../../../../src/renderer/viz/expressions';
import * as s from '../../../../../src/renderer/viz/expressions';
import { hexToRgb } from '../../../../../src/renderer/viz/expressions/utils';
import Metadata from '../../../../../src/renderer/Metadata';
import { ReadStream } from 'tty';

const DEFAULT_COLOR = s.namedColor('gray');

describe('src/renderer/viz/expressions/ramp', () => {
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
        describe('when palettes are color arrays', () => {
            describe('when categories are qualitative', () => {
                const METADATA = new Metadata({
                    properties: {
                        grade: {
                            type: 'category',
                            categories: [
                                { grade: 'A' }, 
                                { grade: 'B' },
                                { grade: 'C' },
                                { grade: 'D' },
                                { grade: 'E' }
                            ]
                        }
                    }
                });
                
                const red = s.namedColor('red');
                const blue = s.namedColor('blue');
                const yellow = s.namedColor('yellow');
                const purple = s.namedColor('purple');
                const green = s.namedColor('green');
                const orange = s.namedColor('orange');

                let actual;
                let expected;

                describe('and there are less categories than colors', () => {
                    describe('and not all categories in the dataset have a bucket defined', () => {
                        it('should not show interpolation', () => {
                            let r;
                            
                            r = ramp(buckets('A', ['A', 'B', 'C']), [red, blue, yellow, purple]);

                            r._compile(METADATA);
                            actual = r.eval();
                            expected = red._nameToRGBA();
            
                            expect(actual).toEqual(expected);

                            r = ramp(buckets('B', ['A', 'B', 'C']), [red, blue, yellow, purple]);

                            r._compile(METADATA);
                            actual = r.eval();
                            expected = blue._nameToRGBA();
            
                            expect(actual).toEqual(expected);

                            r = ramp(buckets('C', ['A', 'B', 'C']), [red, blue, yellow, purple]);

                            r._compile(METADATA);
                            actual = r.eval();
                            expected = yellow._nameToRGBA();
            
                            expect(actual).toEqual(expected);
                        });

                        it('should use last color for the remaining categories', () => {
                            const r = ramp(buckets('D', ['A', 'B', 'C']), [red, blue, yellow, purple]);

                            r._compile(METADATA);
                            actual = r.eval();
                            expected = purple._nameToRGBA();
            
                            expect(actual).toEqual(expected);
                        });

                        it('should use only the same number of colors as categories', () => {
                            const COLORS = [red, blue, yellow, green, orange, purple];
                            const CATEGORIES = ['A', 'B', 'C'];
                            let r;
                            
                            r = ramp(buckets('A', CATEGORIES), COLORS);

                            r._compile(METADATA);
                            actual = r.eval();
                            expected = red._nameToRGBA();
            
                            expect(actual).toEqual(expected);

                            r = ramp(buckets('B', CATEGORIES), COLORS);

                            r._compile(METADATA);
                            actual = r.eval();
                            expected = blue._nameToRGBA();
            
                            expect(actual).toEqual(expected);

                            r = ramp(buckets('C', CATEGORIES), COLORS);

                            r._compile(METADATA);
                            actual = r.eval();
                            expected = yellow._nameToRGBA();
            
                            expect(actual).toEqual(expected);

                            r = ramp(buckets('D', CATEGORIES), COLORS);

                            r._compile(METADATA);
                            actual = r.eval();
                            expected = green._nameToRGBA();
            
                            expect(actual).toEqual(expected);

                            r = ramp(buckets('E', CATEGORIES), COLORS);

                            r._compile(METADATA);
                            actual = r.eval();
                            expected = green._nameToRGBA();
            
                            expect(actual).toEqual(expected);
                        });
                    });

                    describe('and all categories in the dataset have a bucket defined', () => {
                        it('should show interpolation', () => {
                            const r = ramp(buckets('E', ['A', 'B', 'C', 'D', 'E']), [red, blue, yellow, purple, green, orange]);

                            r._compile(METADATA);
                            actual = r.eval();
                            expected = orange._nameToRGBA();
            
                            expect(actual).not.toEqual(expected);
                        });
                    });
                });

                describe('and there are the same number of categories than colors', () => {
                    describe('and not all categories in the dataset have a bucket defined', () => {
                        it('should not show interpolation', () => {
                            const categories = ['A', 'B', 'C'];
                            const colors = [red, green, yellow];
                            let r;
                            let actual, expected;

                            r = ramp(buckets('A', categories), colors);
                            r._compile(METADATA);

                            actual = r.eval();
                            expected = red._nameToRGBA();
                            expect(actual).toEqual(expected);

                            r = ramp(buckets('B', categories), colors);
                            r._compile(METADATA);

                            actual = r.eval();
                            expected = green._nameToRGBA();
                            expect(actual).toEqual(expected);

                            r = ramp(buckets('C', categories), colors);
                            r._compile(METADATA);

                            actual = r.eval();
                            expected = yellow._nameToRGBA();
                            expect(actual).toEqual(expected);
                        });

                        it('should use the last color for the last category', () => {
                            const r = ramp(buckets('D', ['A', 'B', 'C']), [red, blue, purple]);
                            r._compile(METADATA);

                            actual = r.eval();
                            expected = DEFAULT_COLOR._nameToRGBA();
                            checkRGBAThreshold.call(this, actual, expected);
                        });

                        it('should use last color for the remaining categories', () => {
                            const r = ramp(buckets('D', ['A', 'B', 'C']), [red, blue, purple]);
                            r._compile(METADATA);

                            actual = r.eval();
                            expected = DEFAULT_COLOR._nameToRGBA();
            
                            expect(actual).toEqual(expected);
                        });
                    });

                    describe('and all categories in the dataset have a bucket defined', () => {
                        it('should not show interpolation', () => {
                            const categories = ['A', 'B', 'C', 'D', 'E'];
                            const colors = [red, blue, yellow, purple, green];

                            categories.forEach((category, index) => {
                                const r = ramp(buckets(category, categories), colors);
                                let actual, expected;

                                r._compile(METADATA);

                                actual = r.eval();
                                expected = colors[index]._nameToRGBA();
                                
                                checkRGBAThreshold.call(this, actual, expected);
                            });
                        });
                    });
                });

                describe('and there are more categories than colors', () => {
                    describe('and not all categories in the dataset have a bucket defined', () => {
                        it('should use the default color for the remaining categories', () => {
                            const r = ramp(buckets('E', ['A', 'B', 'C', 'D']), [red, blue]);

                            r._compile(METADATA);
                            actual = r.eval();
                            expected = DEFAULT_COLOR._nameToRGBA();
            
                            expect(actual).toEqual(expected);
                        });
                    });
                });
            });

            describe('when categories are quantitative', () => {                
                const red = s.namedColor('red');
                const blue = s.namedColor('blue');
                const yellow = s.namedColor('yellow');
                const purple = s.namedColor('purple');
                const green = s.namedColor('green');
                const orange = s.namedColor('orange');

                describe('and there are less buckets than colors', () => {
                    const RANGES = [10, 20, 30];
                    const COLORS = [red, blue, yellow, purple, green, orange];
                    let r;

                    let actual;
                    let expected;
                    
                    it('should not show interpolation', () => {
                        r = ramp(buckets(1, RANGES), COLORS);

                        r._compile();
                        actual = r.eval();
                        expected = COLORS[0]._nameToRGBA();
        
                        expect(actual).toEqual(expected);

                        r = ramp(buckets(11, RANGES), COLORS);

                        r._compile();
                        actual = r.eval();
                        expected = COLORS[1]._nameToRGBA();
        
                        expect(actual).toEqual(expected);

                        r = ramp(buckets(21, RANGES), COLORS);

                        r._compile();
                        actual = r.eval();
                        expected = COLORS[2]._nameToRGBA();
        
                        expect(actual).toEqual(expected);
                    });

                    it('should ignore the remaining colors and use the last color for the rest of the buckets', () => {
                        r = ramp(buckets(31, RANGES), COLORS);

                        r._compile();
                        actual = r.eval();
                        expected = orange._nameToRGBA();
                    });
                });

                describe('and there are the same number of buckets than colors', () => {
                    const RANGES = [10, 20, 30];
                    const COLORS = [red, blue, yellow];
                    let r;

                    let actual;
                    let expected;

                    it('should not show interpolation', () => {
                        r = ramp(buckets(1, RANGES), COLORS);

                        r._compile();
                        actual = r.eval();
                        expected = COLORS[0]._nameToRGBA();
        
                        expect(actual).toEqual(expected);

                        r = ramp(buckets(11, RANGES), COLORS);

                        r._compile();
                        actual = r.eval();
                        expected = COLORS[1]._nameToRGBA();
        
                        expect(actual).toEqual(expected);

                        r = ramp(buckets(21, RANGES), COLORS);

                        r._compile();
                        actual = r.eval();
                        expected = COLORS[2]._nameToRGBA();
        
                        expect(actual).toEqual(expected);
                    });

                    it('should use the last color for the rest of the buckets', () => {
                        r = ramp(buckets(31, RANGES), COLORS);

                        r._compile();
                        actual = r.eval();
                        expected = yellow._nameToRGBA();
                    });
                });

                describe('and there are more buckets than colors', () => {
                    const RANGES = [10, 20, 30, 40, 50];
                    const COLORS = [red, blue, yellow];
                    let r;

                    let actual;
                    let expected;

                    it('should show interpolation', () => {
                        r = ramp(buckets(1, RANGES), COLORS);

                        r._compile();
                        actual = r.eval();
                        expected = COLORS[0]._nameToRGBA();
        
                        expect(actual).toEqual(expected);

                        r = ramp(buckets(11, RANGES), COLORS);

                        r._compile();
                        actual = r.eval();
                        expected = COLORS[1]._nameToRGBA();
        
                        expect(actual).not.toEqual(expected);

                        r = ramp(buckets(21, RANGES), COLORS);

                        r._compile();
                        actual = r.eval();
                        expected = COLORS[2]._nameToRGBA();
        
                        expect(actual).not.toEqual(expected);
                    });

                    it('should use the default color for the rest', () => {
                        r = ramp(buckets(51, RANGES), COLORS);

                        r._compile();
                        actual = r.eval();
                        expected = DEFAULT_COLOR._nameToRGBA();
        
                        expect(actual).toEqual(expected);
                    });
                });
            });
        });
    

        describe('when palettes are defined palettes', () => {
            describe('and palettes are qualitative', () => {
                const METADATA = new Metadata({
                    properties: {
                        city: {
                            type: 'category',
                            categories: [
                                { city: 'Murcia' }, 
                                { city: 'Madrid' },
                                { city: 'Pontevedra' },
                                { city: 'Barcelona' },
                                { city: 'Alicante' },
                                { city: 'Cordoba' },
                                { city: 'Zaragoza' }
                            ]
                        }
                    }
                });

                let actual;
                let expected;

                describe('and not all categories in the dataset have a bucket defined', () => {
                    const CATEGORIES = ['Pontevedra', 'Zaragoza', 'Cordoba', 'Alicante', 'Murcia'];
                    const RAMP_COLORS = cartocolor.Prism[CATEGORIES.length];

                    it('should not show interpolation', () => {
                        let r;
                        
                        CATEGORIES.forEach((category, index) => {
                            r = ramp(buckets(category, CATEGORIES), palettes.PRISM);
    
                            r._compile(METADATA);
                            actual = r.eval();
                            expected = hexToRgb(RAMP_COLORS[index]);
            
                            expect(actual).toEqual(expected);  
                        });             
                    });
    
                    it('should use last color for the remaining categories', () => {
                        const r = ramp(buckets('Madrid', CATEGORIES), palettes.PRISM);
    
                        r._compile(METADATA);
                        actual = r.eval();
                        expected = hexToRgb(RAMP_COLORS[5]);
        
                        expect(actual).toEqual(expected);  
                    });
                });

                describe('and all categories in the dataset have a bucket defined', () => {
                    const CATEGORIES = ['Murcia', 'Madrid', 'Pontevedra', 'Barcelona', 'Alicante', 'Cordoba', 'Zaragoza'];
                    const RAMP_COLORS = cartocolor.Prism[CATEGORIES.length];
                    
                    it('should not show interpolation', () => {
                        const r = ramp(buckets('Barcelona', CATEGORIES), palettes.PRISM);
    
                        r._compile(METADATA);
                        actual = r.eval();
                        expected = hexToRgb(RAMP_COLORS[3]);
        
                        expect(actual).not.toEqual(expected);                        
                    });

                    it('should not set the last ramp color to the last category', () => {
                        const r = ramp(buckets('Zaragoza', CATEGORIES), palettes.PRISM);
    
                        r._compile(METADATA);
                        actual = r.eval();
                        expected = hexToRgb(RAMP_COLORS[6]);
        
                        expect(actual).not.toEqual(expected);  
                    });
                });
            });

            describe('and palettes are quantitative', () => {
                const METADATA = new Metadata({
                    properties: {
                        grade: {
                            type: 'number'
                        }
                    }
                });

                let actual;
                let expected;

                describe('and there are less or equal categories than the max quantitative ramp length (7)', () => {
                    const CATEGORIES = [10, 20, 30];
                    const RAMP_COLORS = cartocolor.Burg[CATEGORIES.length];
                    
                    it('should not show interpolation', () => {
                        CATEGORIES.forEach((category, index) => {
                            const r = ramp(buckets(category - 1, CATEGORIES), palettes.BURG);

                            r._compile(METADATA);
                            actual = r.eval();
                            expected = hexToRgb(RAMP_COLORS[index]);
            
                            expect(actual).toEqual(expected);  
                        });
                    });
                });
    
                describe('and there are more categories than the max quantitative ramp length (7)', () => {
                    it('should show interpolation', () => {
                        const CATEGORIES = [10, 20, 30, 40, 50, 60, 70, 80, 90];
                        const RAMP_COLORS = cartocolor.Burg[7];
                        let r;

                        r = ramp(buckets(9, CATEGORIES), palettes.BURG);

                        r._compile(METADATA);
                        actual = r.eval();
                        expected = hexToRgb(RAMP_COLORS[0]);
        
                        expect(actual).toEqual(expected);

                        r = ramp(buckets(10, CATEGORIES), palettes.BURG);

                        r._compile(METADATA);
                        actual = r.eval();
                        expected = hexToRgb(RAMP_COLORS[1]);
        
                        expect(actual).not.toEqual(expected);
                    });
                });
            });
        });
    });

    describe('.eval with numeric expressions', () => {
        describe('when palettes are color arrays', () => {
            const METADATA = new Metadata({
                properties: {
                    price: { type: 'number', min: 0, max: 5 },
                },
                sample: [
                    { price: 0 },
                    { price: 1 },
                    { price: 2 },
                    { price: 3 },
                    { price: 4 },
                    { price: 5 },
                ]
            });

            const $price = s.property('price');
            const red = s.namedColor('red');
            const blue = s.namedColor('blue');
            const yellow = s.namedColor('yellow');
            const purple = s.namedColor('purple');
            const green = s.namedColor('green');

            let actual;
            let expected;

            describe('classification', () => {
                describe('and there are less categories than colors', () => {
                    it('should show interpolation', () => {
                        const q = globalQuantiles($price, 4);
                        const r = ramp(q,[red, blue, yellow, purple, green]);
                        r._compile(METADATA);

                        actual = r.eval({ price: 1 });
                        expected = red._nameToRGBA();

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 2.1 });
                        expected = blue._nameToRGBA();
                        
                        expect(actual).not.toEqual(expected);
                        
                        actual = r.eval({price: 3.1});
                        expected = yellow._nameToRGBA();
                        
                        expect(actual).not.toEqual(expected);
                    });
                });

                describe('and there are the same number of categories than colors', () => {
                    it('should not show interpolation', () => {
                        const q = globalQuantiles($price, 4);
                        const r = ramp(q,[red, blue, yellow]);
                        r._compile(METADATA);

                        actual = r.eval({ price: 1 });
                        expected = red._nameToRGBA();

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 2.1 });
                        expected = blue._nameToRGBA();
                        
                        expect(actual).toEqual(expected);
                        
                        actual = r.eval({price: 3.1});
                        expected = yellow._nameToRGBA();
                        
                        expect(actual).toEqual(expected);
                    });
                });

                describe('and there are more categories than colors', () => {
                    it('should show interpolation', () => {
                        const q = globalQuantiles($price, 3);
                        const r = ramp(q,[red, blue]);
                        r._compile(METADATA);

                        actual = r.eval({price: 1});
                        expected = red._nameToRGBA();
                        
                        expect(actual).toEqual(expected);
                        
                        actual = r.eval({price: 3});
                        expected = blue._nameToRGBA();
                        
                        expect(actual).not.toEqual(expected);
                    });
                });
            });

            describe('interpolation', () => {

            });
        });

        describe('when palettes are defined palettes', () => {
            const METADATA = new Metadata({
                properties: {
                    price: { type: 'number', min: 0, max: 10 },
                },
                sample: [
                    { price: 0 },
                    { price: 1 },
                    { price: 2 },
                    { price: 3 },
                    { price: 4 },
                    { price: 5 },
                    { price: 6 },
                    { price: 7 },
                    { price: 8 },
                    { price: 9 },
                    { price: 10 }
                ]
            });

            const $price = s.property('price');
            let actual;
            let expected;

            describe('classification', () => {
                describe('and there are less categories than colors', () => {
                    xit('should not show interpolation', () => {
                        const RAMP_COLORS = cartocolor.Sunset[3];
                        const q = globalQuantiles($price, 4);
                        const r = ramp(q, palettes.SUNSET);
                        r._compile(METADATA);

                        actual = r.eval({ price: 1 });
                        expected = hexToRgb(RAMP_COLORS[0]);

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 2.1 });
                        expected = hexToRgb(RAMP_COLORS[1]);
                        
                        expect(actual).toEqual(expected);
                        
                        actual = r.eval({price: 3.1});
                        expected = hexToRgb(RAMP_COLORS[2]);
                        
                        expect(actual).toEqual(expected);
                    });
                });

                describe('and there are the same number of categories than colors', () => {
                    it('should not show interpolation', () => {
                        const q = globalQuantiles($price, 4);
                        const r = ramp(q, palettes.PRISM);
                        r._compile(METADATA);
                    });
                });

                describe('and there are more categories than colors', () => {
                    it('should show interpolation', () => {
                        const q = globalQuantiles($price, 3);
                        const r = ramp(q, palettes.PRISM);
                        r._compile(METADATA);
                    });
                });
            });
        });
    });
});
