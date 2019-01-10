import { validateTypeErrors, validateMaxArgumentsError, validateDynamicType } from './utils';
import * as cartocolor from 'cartocolor';
import { ramp, buckets, palettes, globalQuantiles, top, linear, namedColor, property, zoomrange, BICYCLE, CAR, BUILDING, globalEqIntervals } from '../../../../../src/renderer/viz/expressions';
import { hexToRgb } from '../../../../../src/renderer/viz/expressions/utils';
import Metadata from '../../../../../src/renderer/Metadata';
import { OTHERS_LABEL } from '../../../../../src/renderer/viz/expressions/constants';

const DEFAULT_COLOR = namedColor('gray');

describe('src/renderer/viz/expressions/ramp', () => {
    describe('error control', () => {
        validateTypeErrors('ramp', []);
        validateTypeErrors('ramp', ['number']);
        validateTypeErrors('ramp', ['category']);
        validateTypeErrors('ramp', ['number', 'image-list']);
        validateTypeErrors('ramp', ['number', 'image-list', 'number']);
        validateMaxArgumentsError('ramp', ['number', 'color-list', 'number', 'number']);
    });

    describe('type', () => {
        validateDynamicType('ramp', ['number', 'palette'], 'color');
        validateDynamicType('ramp', ['number', 'number-list', 'number'], 'number');
        validateDynamicType('ramp', ['category', 'palette'], 'color');
        validateDynamicType('ramp', ['category', 'palette', 'color'], 'color');
        validateDynamicType('ramp', ['category', 'color-list'], 'color');
        validateDynamicType('ramp', ['category', 'color-list', 'color'], 'color');
        validateDynamicType('ramp', ['category', 'number-list'], 'number');
        validateDynamicType('ramp', ['category', 'image-list'], 'image');
    });

    describe('.eval', () => {
        describe('when palettes are color arrays', () => {
            const METADATA = new Metadata({
                properties: {
                    grade: {
                        type: 'category',
                        categories: [
                            { name: 'A' },
                            { name: 'B' }
                        ]
                    }
                }
            });

            describe('and values are numeric', () => {
                const values = [31, 57];
                let actual;
                let expected;

                it('should get the first value', () => {
                    const r = ramp(property('grade'), values);

                    r._bindMetadata(METADATA);
                    actual = r.eval({ grade: 'A' });
                    expected = values[0];

                    expect(actual).toEqual(expected);
                });

                it('should be able to get the second value', () => {
                    const r = ramp(property('grade'), values);

                    r._bindMetadata(METADATA);
                    actual = r.eval({ grade: 'B' });
                    expected = values[1];

                    expect(actual).toEqual(expected);
                });
            });

            describe('and values are colors', () => {
                const firstColor = namedColor('red');
                const secondColor = namedColor('blue');
                let actual;
                let expected;

                it('should get the first value', () => {
                    const r = ramp(property('grade'), [firstColor, secondColor]);

                    r._bindMetadata(METADATA);
                    actual = r.eval({ grade: 'A' });
                    expected = firstColor.value;

                    expect(actual).toEqual(expected);
                });

                it('should get the second value', () => {
                    const r = ramp(property('grade'), [firstColor, secondColor]);

                    r._bindMetadata(METADATA);
                    actual = r.eval({ grade: 'B' });
                    expected = secondColor.value;

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
                                { name: 'A' },
                                { name: 'B' },
                                { name: 'C' },
                                { name: 'D' },
                                { name: 'E' }
                            ]
                        }
                    }
                });

                const red = namedColor('red');
                const blue = namedColor('blue');
                const yellow = namedColor('yellow');
                const purple = namedColor('purple');
                const green = namedColor('green');
                const orange = namedColor('orange');

                let actual;
                let expected;
                const $grade = property('grade');

                describe('and there are less categories than colors', () => {
                    describe('and not all categories in the dataset have a bucket defined', () => {
                        it('should show interpolation', () => {
                            let r;
                            r = ramp(buckets($grade, ['A', 'B', 'C']), [red, blue, yellow, purple]);

                            r._bindMetadata(METADATA);
                            actual = r.eval({ grade: 'A' });
                            expected = red.value;

                            expect(actual).toEqual(expected);

                            r = ramp(buckets($grade, ['A', 'B', 'C']), [red, blue, yellow, purple]);

                            r._bindMetadata(METADATA);
                            actual = r.eval({ grade: 'C' });
                            expected = purple.value;

                            expect(actual).toEqual(expected);
                        });

                        it('should use the others color for the remaining categories', () => {
                            const r = ramp(buckets('D', ['A', 'B', 'C']), [red, blue, yellow], purple);

                            r._bindMetadata(METADATA);
                            actual = r.eval();
                            expected = purple.value;

                            expect(actual).toEqual(expected);
                        });
                    });

                    describe('and all categories in the dataset have a bucket defined', () => {
                        it('should show interpolation', () => {
                            const r = ramp(buckets('E', ['A', 'B', 'C', 'D', 'E']), [red, blue, yellow, purple, green, orange], purple);

                            r._bindMetadata(METADATA);
                            actual = r.eval();
                            expected = purple.value;

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
                            r._bindMetadata(METADATA);

                            actual = r.eval();
                            expected = red.value;
                            expect(actual).toEqual(expected);

                            r = ramp(buckets('B', categories), colors);
                            r._bindMetadata(METADATA);

                            actual = r.eval();
                            expected = green.value;
                            expect(actual).toEqual(expected);

                            r = ramp(buckets('C', categories), colors);
                            r._bindMetadata(METADATA);

                            actual = r.eval();
                            expected = yellow.value;
                            expect(actual).toEqual(expected);
                        });

                        it('should use the default color for the remaining categories', () => {
                            const r = ramp(buckets('D', ['A', 'B', 'C']), [red, blue, purple]);
                            r._bindMetadata(METADATA);

                            actual = r.eval();
                            expected = DEFAULT_COLOR.value;

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

                                r._bindMetadata(METADATA);

                                actual = r.eval();
                                expected = colors[index].value;

                                expect(actual).toEqual(expected);
                            });
                        });
                    });
                });

                describe('and there are more categories than colors', () => {
                    describe('and not all categories in the dataset have a bucket defined', () => {
                        it('should use the default color for the remaining categories', () => {
                            const r = ramp(buckets('E', ['A', 'B', 'C', 'D']), [red, blue]);

                            r._bindMetadata(METADATA);
                            actual = r.eval();
                            expected = DEFAULT_COLOR.value;

                            expect(actual).toEqual(expected);
                        });
                    });
                });
            });

            describe('when categories are quantitative', () => {
                const METADATA = new Metadata({
                    properties: {
                        grade: {
                            type: 'category',
                            categories: [
                                { name: 'A' },
                                { name: 'B' },
                                { name: 'C' },
                                { name: 'D' },
                                { name: 'E' }
                            ]
                        }
                    }
                });

                const red = namedColor('red');
                const blue = namedColor('blue');
                const yellow = namedColor('yellow');
                const purple = namedColor('purple');
                const green = namedColor('green');
                const orange = namedColor('orange');

                describe('and there are less buckets than colors', () => {
                    const RANGES = [10, 20, 30];
                    const COLORS = [red, blue, yellow, purple, green, orange];
                    let r;

                    let actual;
                    let expected;

                    it('should show interpolation', () => {
                        r = ramp(buckets(1, RANGES), COLORS);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = red.value;

                        expect(actual).toEqual(expected);

                        r = ramp(buckets(31, RANGES), COLORS);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = orange.value;

                        expect(actual).toEqual(expected);
                    });
                });

                describe('and there are the same number of buckets than colors', () => {
                    const RANGES = [10, 20, 30];
                    const COLORS = [red, blue, yellow, purple];
                    let r;

                    let actual;
                    let expected;

                    it('should not show interpolation', () => {
                        r = ramp(buckets(1, RANGES), COLORS);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = COLORS[0].value;

                        expect(actual).toEqual(expected);

                        r = ramp(buckets(11, RANGES), COLORS);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = COLORS[1].value;

                        expect(actual).toEqual(expected);

                        r = ramp(buckets(21, RANGES), COLORS);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = COLORS[2].value;

                        expect(actual).toEqual(expected);
                    });

                    it('should use the last color for the rest of the buckets', () => {
                        r = ramp(buckets(31, RANGES), COLORS);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = purple.value;
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

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = COLORS[0].value;

                        expect(actual).toEqual(expected);

                        r = ramp(buckets(11, RANGES), COLORS);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = COLORS[1].value;

                        expect(actual).not.toEqual(expected);

                        r = ramp(buckets(21, RANGES), COLORS);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = COLORS[2].value;

                        expect(actual).not.toEqual(expected);
                    });

                    it('should use the last color for the last bucket', () => {
                        r = ramp(buckets(51, RANGES), COLORS);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = yellow.value;

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
                                { name: 'Murcia' },
                                { name: 'Madrid' },
                                { name: 'Pontevedra' },
                                { name: 'Barcelona' },
                                { name: 'Alicante' },
                                { name: 'Cordoba' },
                                { name: 'Zaragoza' }
                            ]
                        }
                    }
                });

                let actual;
                let expected;

                describe('and not all categories in the dataset have a bucket defined', () => {
                    const BREAKPOINTS = ['Pontevedra', 'Zaragoza', 'Cordoba', 'Alicante', 'Murcia'];
                    const RAMP_COLORS = cartocolor.Prism[BREAKPOINTS.length];

                    it('should not show interpolation', () => {
                        let r;

                        BREAKPOINTS.forEach((category, index) => {
                            r = ramp(buckets(category, BREAKPOINTS), palettes.PRISM);

                            r._bindMetadata(METADATA);
                            actual = r.eval({ city: BREAKPOINTS[index] });
                            expected = hexToRgb(RAMP_COLORS[index]);

                            expect(actual).toEqual(expected);
                        });
                    });

                    it('should use last color for the remaining categories', () => {
                        const r = ramp(buckets('Madrid', BREAKPOINTS), palettes.PRISM);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = hexToRgb(RAMP_COLORS[5]);

                        expect(actual).toEqual(expected);
                    });

                    it('should use the default "others" color for the remaining categories', () => {
                        const red = namedColor('red');
                        const r = ramp(buckets('Madrid', BREAKPOINTS), palettes.PRISM, red);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = red.eval();

                        expect(actual).toEqual(expected);
                    });
                });

                describe('and all categories in the dataset have a bucket defined', () => {
                    const BREAKPOINTS = ['Murcia', 'Madrid', 'Pontevedra', 'Barcelona', 'Alicante', 'Cordoba', 'Zaragoza'];
                    const RAMP_COLORS = cartocolor.Prism[BREAKPOINTS.length];

                    it('should not show interpolation', () => {
                        const r = ramp(buckets('Barcelona', BREAKPOINTS), palettes.PRISM);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = hexToRgb(RAMP_COLORS[3]);

                        expect(actual).toEqual(expected);
                    });

                    it('should set the last ramp color to the last category', () => {
                        const r = ramp(buckets('Zaragoza', BREAKPOINTS), palettes.PRISM);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = hexToRgb(RAMP_COLORS[6]);

                        expect(actual).toEqual(expected);
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
                    const BREAKPOINTS = [10, 20, 30];
                    const RAMP_COLORS = cartocolor.Burg[BREAKPOINTS.length + 1];

                    it('should not show interpolation', () => {
                        BREAKPOINTS.forEach((category, index) => {
                            const r = ramp(buckets(category - 1, BREAKPOINTS), palettes.BURG);

                            r._bindMetadata(METADATA);
                            actual = r.eval();
                            expected = hexToRgb(RAMP_COLORS[index]);

                            expect(actual).toEqual(expected);
                        });
                    });
                });

                describe('and there are more categories than the max quantitative ramp length (7)', () => {
                    it('should show interpolation', () => {
                        const BREAKPOINTS = [10, 20, 30, 40, 50, 60, 70, 80, 90];
                        const RAMP_COLORS = cartocolor.Burg[7];
                        let r;

                        r = ramp(buckets(9, BREAKPOINTS), palettes.BURG);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = hexToRgb(RAMP_COLORS[0]);

                        expect(actual).toEqual(expected);

                        r = ramp(buckets(10, BREAKPOINTS), palettes.BURG);

                        r._bindMetadata(METADATA);
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
                    price: { type: 'number', min: 0, max: 5 }
                },
                sample: [
                    { price: 0 },
                    { price: 1 },
                    { price: 2 },
                    { price: 3 },
                    { price: 4 },
                    { price: 5 }
                ]
            });

            const $price = property('price');
            const red = namedColor('red');
            const blue = namedColor('blue');
            const yellow = namedColor('yellow');
            const purple = namedColor('purple');
            const green = namedColor('green');

            let actual;
            let expected;

            describe('classification', () => {
                describe('and there are less categories than colors', () => {
                    it('should show interpolation', () => {
                        const q = globalQuantiles($price, 4);
                        const r = ramp(q, [red, blue, yellow, purple, green]);
                        r._resolveAliases();
                        r._bindMetadata(METADATA);

                        actual = r.eval({ price: 1 });
                        expected = red.value;

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 5.1 });
                        expected = green.value;

                        expect(actual).toEqual(expected);
                    });
                });

                describe('and there are the same number of categories than colors', () => {
                    it('should not show interpolation', () => {
                        const q = globalQuantiles($price, 4);
                        const r = ramp(q, [red, blue, yellow, purple]);
                        r._resolveAliases();
                        r._bindMetadata(METADATA);

                        actual = r.eval({ price: 1 });
                        expected = red.value;

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 2.1 });
                        expected = blue.value;

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 3.1 });
                        expected = yellow.value;

                        expect(actual).toEqual(expected);
                    });
                });

                describe('and there are more categories than colors', () => {
                    it('should show interpolation', () => {
                        const q = globalQuantiles($price, 3);
                        const r = ramp(q, [red, blue]);
                        r._resolveAliases();
                        r._bindMetadata(METADATA);

                        actual = r.eval({ price: 1 });
                        expected = red.value;

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 3 });
                        expected = blue.value;

                        expect(actual).not.toEqual(expected);
                    });
                });
            });

            describe('interpolation', () => {
                const METADATA = new Metadata({
                    properties: {
                        price: { type: 'number', min: 1, max: 5 }
                    },
                    sample: [
                        { price: 1 },
                        { price: 2 },
                        { price: 3 },
                        { price: 4 },
                        { price: 5 }
                    ]
                });

                describe('and it uses linear expression', () => {
                    it('should show interpolation', () => {
                        const q = linear($price);
                        const r = ramp(q, [red, blue, yellow, purple, green]);
                        r._bindMetadata(METADATA);

                        actual = r.eval({ price: 1 });
                        expected = red.value;

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 2.1 });
                        expected = blue.value;

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 3.1 });
                        expected = yellow.value;

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 4.1 });
                        expected = purple.value;

                        expect(actual).not.toEqual(expected);
                    });
                });

                describe('and it does not use linear expression', () => {
                    it('should show interpolation', () => {
                        const q = $price;
                        const r = ramp(q, [red, blue, yellow, purple, green]);
                        r._bindMetadata(METADATA);

                        actual = r.eval({ price: 1 });
                        expected = red.value;

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 2.1 });
                        expected = blue.value;

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 3.1 });
                        expected = yellow.value;

                        expect(actual).not.toEqual(expected);
                    });
                });
            });
        });

        describe('when palettes are defined palettes', () => {
            describe('classification', () => {
                describe('and there are between 2 and 7 colors', () => {
                    const METADATA = new Metadata({
                        properties: {
                            price: { type: 'number', min: 1, max: 13 }
                        },
                        sample: [
                            { price: 1 },
                            { price: 2 },
                            { price: 3 },
                            { price: 4 },
                            { price: 5 },
                            { price: 6 },
                            { price: 7 },
                            { price: 8 },
                            { price: 9 },
                            { price: 10 },
                            { price: 11 },
                            { price: 12 },
                            { price: 13 }
                        ]
                    });

                    const $price = property('price');
                    let actual;
                    let expected;

                    it('should not show interpolation', () => {
                        const RAMP_COLORS = cartocolor.Sunset[3];
                        const q = globalQuantiles($price, 3);
                        const r = ramp(q, palettes.SUNSET);
                        r._resolveAliases();
                        r._bindMetadata(METADATA);

                        actual = r.eval({ price: 1 });
                        expected = hexToRgb(RAMP_COLORS[0]);

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 6 });
                        expected = hexToRgb(RAMP_COLORS[1]);

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 10 });
                        expected = hexToRgb(RAMP_COLORS[2]);

                        expect(actual).toEqual(expected);
                    });
                });

                describe('and there are more than 7 colors', () => {
                    const METADATA = new Metadata({
                        properties: {
                            price: { type: 'number', min: 0, max: 10 }
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

                    const $price = property('price');
                    let actual;
                    let expected;

                    it('should show interpolation', () => {
                        const RAMP_COLORS = cartocolor.Sunset[7];
                        const q = globalQuantiles($price, 10);
                        const r = ramp(q, palettes.SUNSET);
                        r._resolveAliases();
                        r._bindMetadata(METADATA);

                        actual = r.eval({ price: 0 });
                        expected = hexToRgb(RAMP_COLORS[0]);

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 1.1 });
                        expected = hexToRgb(RAMP_COLORS[1]);

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 2.1 });
                        expected = hexToRgb(RAMP_COLORS[2]);

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 3.1 });
                        expected = hexToRgb(RAMP_COLORS[3]);

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 4.1 });
                        expected = hexToRgb(RAMP_COLORS[4]);

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 5.1 });
                        expected = hexToRgb(RAMP_COLORS[5]);

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 10 });
                        expected = hexToRgb(RAMP_COLORS[6]);

                        expect(actual).toEqual(expected);
                    });
                });
            });

            describe('interpolation', () => {
                const METADATA = new Metadata({
                    properties: {
                        price: { type: 'number', min: 1, max: 13 }
                    },
                    sample: [
                        { price: 1 },
                        { price: 2 },
                        { price: 3 },
                        { price: 4 },
                        { price: 5 },
                        { price: 6 },
                        { price: 7 },
                        { price: 8 },
                        { price: 9 },
                        { price: 10 },
                        { price: 11 },
                        { price: 12 },
                        { price: 13 }
                    ]
                });

                const $price = property('price');
                let actual;
                let expected;

                describe('and it uses linear expression', () => {
                    it('should show interpolation', () => {
                        const RAMP_COLORS = cartocolor.Sunset[7];
                        const q = linear($price);
                        const r = ramp(q, palettes.SUNSET);
                        r._bindMetadata(METADATA);

                        actual = r.eval({ price: 1 });
                        expected = hexToRgb(RAMP_COLORS[0]);

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 1.1 });
                        expected = hexToRgb(RAMP_COLORS[1]);

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 2.1 });
                        expected = hexToRgb(RAMP_COLORS[2]);

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 3.1 });
                        expected = hexToRgb(RAMP_COLORS[3]);

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 4.1 });
                        expected = hexToRgb(RAMP_COLORS[4]);

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 5.1 });
                        expected = hexToRgb(RAMP_COLORS[5]);

                        expect(actual).not.toEqual(expected);
                    });
                });

                describe('and it does not use linear expression', () => {
                    it('should show interpolation', () => {
                        const RAMP_COLORS = cartocolor.Sunset[7];
                        const r = ramp($price, palettes.SUNSET);
                        r._bindMetadata(METADATA);

                        actual = r.eval({ price: 1 });
                        expected = hexToRgb(RAMP_COLORS[0]);

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 1.1 });
                        expected = hexToRgb(RAMP_COLORS[1]);

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 2.1 });
                        expected = hexToRgb(RAMP_COLORS[2]);

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 3.1 });
                        expected = hexToRgb(RAMP_COLORS[3]);

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 4.1 });
                        expected = hexToRgb(RAMP_COLORS[4]);

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 5.1 });
                        expected = hexToRgb(RAMP_COLORS[5]);

                        expect(actual).not.toEqual(expected);
                    });
                });
            });
        });

        describe('when the input is zoomrange()', () => {
            const METADATA = new Metadata({
                properties: {
                    price: { type: 'number', min: 1, max: 13 }
                },
                sample: [
                    { price: 1 },
                    { price: 2 },
                    { price: 3 },
                    { price: 4 },
                    { price: 5 },
                    { price: 6 },
                    { price: 7 },
                    { price: 8 },
                    { price: 9 },
                    { price: 10 },
                    { price: 11 },
                    { price: 12 },
                    { price: 13 }
                ]
            });

            it('should return the first number in the array at low zoom levels', () => {
                const r = ramp(zoomrange([3, 9]), [100, 200]);
                r._bindMetadata(METADATA);
                const fakeGL = { uniform1f: () => { }, uniform1i: () => { } };
                const fakeDrawMetadata = { zoomLevel: 0 };
                r._preDraw(null, fakeDrawMetadata, fakeGL);
                const actual = r.eval();
                expect(actual).toEqual(100);
            });

            it('should return an interpolated number in the array at a intermediate zoom level', () => {
                const r = ramp(zoomrange([3, 9]), [100, 200]);
                r._bindMetadata(METADATA);
                const fakeGL = { uniform1f: () => { }, uniform1i: () => { } };
                // See zoomrange() implementation to know more about how we create `fakeDrawMetadata`
                const fakeDrawMetadata = { zoomLevel: Math.log2(Math.pow(2, 3) * 0.7 + 0.3 * Math.pow(2, 9)) };
                r._preDraw(null, fakeDrawMetadata, fakeGL);
                const actual = r.eval();
                expect(actual).toEqual(130);
            });

            it('should return the last number in the array at high zoom levels', () => {
                const r = ramp(zoomrange([3, 9]), [100, 200]);
                r._bindMetadata(METADATA);
                const fakeGL = { uniform1f: () => { }, uniform1i: () => { } };
                const fakeDrawMetadata = { zoomLevel: 100 };
                r._preDraw(null, fakeDrawMetadata, fakeGL);
                const actual = r.eval();
                expect(actual).toEqual(200);
            });
        });
    });

    describe('.getLegendData', () => {
        const red = namedColor('red');
        const blue = namedColor('blue');
        const yellow = namedColor('yellow');

        describe('when properties are numbers', () => {
            const METADATA = new Metadata({
                properties: {
                    price: { type: 'number', min: 1, max: 4 }
                },
                sample: [
                    { price: 1 },
                    { price: 2 },
                    { price: 3 },
                    { price: 4 }
                ]
            });

            const $price = property('price');

            describe('and it is a classifier input', () => {
                it('should return legend data', () => {
                    let actual;
                    let expected;

                    const r = ramp(globalEqIntervals($price, 2), [red, blue]);
                    r._resolveAliases();
                    r._bindMetadata(METADATA);

                    actual = r.getLegendData().data;
                    expected = [
                        {
                            key: [Number.NEGATIVE_INFINITY, 2.5],
                            value: red.eval()
                        },
                        {
                            key: [2.5, Number.POSITIVE_INFINITY],
                            value: blue.eval()
                        }
                    ];

                    expect(actual).toEqual(expected);
                });
            });

            describe('and it is a buckets input', () => {
                it('should return legend data', () => {
                    let actual;
                    let expected;

                    const r = ramp(buckets($price, [2.5]), [red, blue]);

                    r._bindMetadata(METADATA);

                    actual = r.getLegendData().data;
                    expected = [
                        {
                            key: [Number.NEGATIVE_INFINITY, 2.5],
                            value: red.eval()
                        },
                        {
                            key: [2.5, Number.POSITIVE_INFINITY],
                            value: blue.eval()
                        }
                    ];

                    expect(actual).toEqual(expected);
                });
            });

            describe('and it is a linear input', () => {
                let actual;
                let expected;

                it('should return the value in ranges', () => {
                    const r = ramp(linear($price), [red, blue]);

                    r._bindMetadata(METADATA);

                    actual = r.getLegendData({ samples: 3 }).data;
                    expected = [
                        {
                            key: 1,
                            value: red.eval()
                        },
                        {
                            key: 2.5,
                            value: { r: 202, g: 0, b: 136, a: 1 } // interpolated
                        },
                        {
                            key: 4,
                            value: blue.eval()
                        }
                    ];
                    expect(actual).toEqual(expected);
                });

                it('should return a proper name', () => {
                    const r = ramp(linear($price), [red, blue]);

                    r._bindMetadata(METADATA);
                    const colorLegend = r.getLegendData();
                    expect(colorLegend.name).toEqual('linear($price, globalMin($price), globalMax($price))');
                });
            });
        });

        describe('when properties are categories', () => {
            const METADATA = new Metadata({
                properties: {
                    grade: {
                        type: 'category',
                        categories: [
                            { name: 'A' },
                            { name: 'B' },
                            { name: 'C' }
                        ]
                    }
                }
            });

            let actual;
            let expected;
            let $grade = property('grade');

            describe('and it is a top input', () => {
                it('should return legend data', () => {
                    const r = ramp(top($grade, 2), [red, blue]);

                    r._bindMetadata(METADATA);
                    actual = r.getLegendData().data;
                    expected = [
                        {
                            key: 'A',
                            value: red.eval()
                        }, {
                            key: 'B',
                            value: blue.eval()
                        }, {
                            key: OTHERS_LABEL,
                            value: r.others.eval()
                        }
                    ];
                });
            });

            describe('and it is a bucket input with a color array', () => {
                it('should return the legend data for an image list', () => {
                    const r = ramp(buckets($grade, ['A', 'B', 'C']), [BICYCLE, CAR, BUILDING]);

                    r._bindMetadata(METADATA);

                    actual = r.getLegendData().data;
                    expected = [
                        {
                            key: 'A',
                            value: BICYCLE.url
                        }, {
                            key: 'B',
                            value: CAR.url
                        }, {
                            key: 'C',
                            value: BUILDING.url
                        },
                        {
                            key: OTHERS_LABEL,
                            value: r.others.eval()
                        }
                    ];

                    expect(actual).toEqual(expected);
                });

                it('should return the letend data for a color list', () => {
                    const r = ramp(buckets($grade, ['A', 'B', 'C']), [red, blue, yellow]);

                    r._bindMetadata(METADATA);

                    actual = r.getLegendData().data;
                    expected = [
                        {
                            key: 'A',
                            value: red.color
                        }, {
                            key: 'B',
                            value: blue.color
                        }, {
                            key: 'C',
                            value: yellow.color
                        },
                        {
                            key: OTHERS_LABEL,
                            value: r.others.eval()
                        }
                    ];

                    expect(actual).toEqual(expected);
                });
            });
        });
    });
});
