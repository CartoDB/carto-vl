import { validateTypeErrors, validateMaxArgumentsError, validateDynamicType } from './utils';
import * as cartocolor from 'cartocolor';
import { ramp, buckets, palettes, globalQuantiles, linear, namedColor, property, rgb, now, sin, zoomrange, imageList, BICYCLE, CAR, BUILDING } from '../../../../../src/renderer/viz/expressions';
import { hexToRgb } from '../../../../../src/renderer/viz/expressions/utils';
import Metadata from '../../../../../src/renderer/Metadata';

const DEFAULT_COLOR = namedColor('gray');

describe('src/renderer/viz/expressions/ramp', () => {
    describe('error control', () => {
        validateTypeErrors('ramp', []);
        validateTypeErrors('ramp', ['number']);
        validateTypeErrors('ramp', ['category']);
        validateTypeErrors('ramp', ['number', 'image-array']);
        validateMaxArgumentsError('ramp', ['number', 'color-array', 'number']);
    });

    describe('type', () => {
        validateDynamicType('ramp', ['number', 'palette'], 'color');
        validateDynamicType('ramp', ['category', 'palette'], 'color');
        validateDynamicType('ramp', ['category', 'color-array'], 'color');
        validateDynamicType('ramp', ['category', 'number-array'], 'number');
        validateDynamicType('ramp', ['category', 'image-array'], 'image');
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
                    expected = firstColor.color;

                    expect(actual).toEqual(expected);
                });

                it('should get the second value', () => {
                    const r = ramp(property('grade'), [firstColor, secondColor]);

                    r._bindMetadata(METADATA);
                    actual = r.eval({ grade: 'B' });
                    expected = secondColor.color;

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
                        it('should not show interpolation', () => {
                            let r;
                            r = ramp(buckets($grade, ['A', 'B', 'C']), [red, blue, yellow, purple]);

                            r._bindMetadata(METADATA);
                            actual = r.eval({ grade: 'A' });
                            expected = red.color;

                            expect(actual).toEqual(expected);

                            r = ramp(buckets($grade, ['A', 'B', 'C']), [red, blue, yellow, purple]);

                            r._bindMetadata(METADATA);
                            actual = r.eval({ grade: 'B' });
                            expected = blue.color;

                            expect(actual).toEqual(expected);

                            r = ramp(buckets($grade, ['A', 'B', 'C']), [red, blue, yellow, purple]);

                            r._bindMetadata(METADATA);
                            actual = r.eval({ grade: 'C' });
                            expected = yellow.color;

                            expect(actual).toEqual(expected);
                        });

                        it('should use last color for the remaining categories', () => {
                            const r = ramp(buckets('D', ['A', 'B', 'C']), [red, blue, yellow, purple]);

                            r._bindMetadata(METADATA);
                            actual = r.eval();
                            expected = purple.color;

                            expect(actual).toEqual(expected);
                        });

                        it('should use only the same number of colors as categories', () => {
                            const COLORS = [red, blue, yellow, green, orange, purple];
                            const CATEGORIES = ['A', 'B', 'C'];
                            let r;

                            r = ramp(buckets('A', CATEGORIES), COLORS);

                            r._bindMetadata(METADATA);
                            actual = r.eval();
                            expected = red.color;

                            expect(actual).toEqual(expected);

                            r = ramp(buckets('B', CATEGORIES), COLORS);

                            r._bindMetadata(METADATA);
                            actual = r.eval();
                            expected = blue.color;

                            expect(actual).toEqual(expected);

                            r = ramp(buckets('C', CATEGORIES), COLORS);

                            r._bindMetadata(METADATA);
                            actual = r.eval();
                            expected = yellow.color;

                            expect(actual).toEqual(expected);

                            r = ramp(buckets('D', CATEGORIES), COLORS);

                            r._bindMetadata(METADATA);
                            actual = r.eval();
                            expected = green.color;

                            expect(actual).toEqual(expected);

                            r = ramp(buckets('E', CATEGORIES), COLORS);

                            r._bindMetadata(METADATA);
                            actual = r.eval();
                            expected = green.color;

                            expect(actual).toEqual(expected);
                        });
                    });

                    describe('and all categories in the dataset have a bucket defined', () => {
                        it('should show interpolation', () => {
                            const r = ramp(buckets('E', ['A', 'B', 'C', 'D', 'E']), [red, blue, yellow, purple, green, orange]);

                            r._bindMetadata(METADATA);
                            actual = r.eval();
                            expected = orange.color;

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
                            expected = red.color;
                            expect(actual).toEqual(expected);

                            r = ramp(buckets('B', categories), colors);
                            r._bindMetadata(METADATA);

                            actual = r.eval();
                            expected = green.color;
                            expect(actual).toEqual(expected);

                            r = ramp(buckets('C', categories), colors);
                            r._bindMetadata(METADATA);

                            actual = r.eval();
                            expected = yellow.color;
                            expect(actual).toEqual(expected);
                        });

                        it('should use the last color for the last category', () => {
                            const r = ramp(buckets('D', ['A', 'B', 'C']), [red, blue, purple]);
                            r._bindMetadata(METADATA);

                            actual = r.eval();
                            expected = DEFAULT_COLOR.color;

                            expect(actual).toEqual(expected);
                        });

                        it('should use last color for the remaining categories', () => {
                            const r = ramp(buckets('D', ['A', 'B', 'C']), [red, blue, purple]);
                            r._bindMetadata(METADATA);

                            actual = r.eval();
                            expected = DEFAULT_COLOR.color;

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
                                expected = colors[index].color;

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
                            expected = DEFAULT_COLOR.color;

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

                    it('should not show interpolation', () => {
                        r = ramp(buckets(1, RANGES), COLORS);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = COLORS[0].color;

                        expect(actual).toEqual(expected);

                        r = ramp(buckets(11, RANGES), COLORS);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = COLORS[1].color;

                        expect(actual).toEqual(expected);

                        r = ramp(buckets(21, RANGES), COLORS);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = COLORS[2].color;

                        expect(actual).toEqual(expected);
                    });

                    it('should ignore the remaining colors and use the last color for the rest of the buckets', () => {
                        r = ramp(buckets(31, RANGES), COLORS);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = orange.color;
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

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = COLORS[0].color;

                        expect(actual).toEqual(expected);

                        r = ramp(buckets(11, RANGES), COLORS);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = COLORS[1].color;

                        expect(actual).toEqual(expected);

                        r = ramp(buckets(21, RANGES), COLORS);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = COLORS[2].color;

                        expect(actual).toEqual(expected);
                    });

                    it('should use the last color for the rest of the buckets', () => {
                        r = ramp(buckets(31, RANGES), COLORS);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = yellow.color;
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
                        expected = COLORS[0].color;

                        expect(actual).toEqual(expected);

                        r = ramp(buckets(11, RANGES), COLORS);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = COLORS[1].color;

                        expect(actual).not.toEqual(expected);

                        r = ramp(buckets(21, RANGES), COLORS);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = COLORS[2].color;

                        expect(actual).not.toEqual(expected);
                    });

                    it('should use the default color for the rest', () => {
                        r = ramp(buckets(51, RANGES), COLORS);

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = DEFAULT_COLOR.color;

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
                    const CATEGORIES = ['Pontevedra', 'Zaragoza', 'Cordoba', 'Alicante', 'Murcia'];
                    const RAMP_COLORS = cartocolor.Prism[CATEGORIES.length];

                    it('should not show interpolation', () => {
                        let r;

                        CATEGORIES.forEach((category, index) => {
                            r = ramp(buckets(category, CATEGORIES), palettes.PRISM);

                            r._bindMetadata(METADATA);
                            actual = r.eval();
                            expected = hexToRgb(RAMP_COLORS[index]);

                            expect(actual).toEqual(expected);
                        });
                    });

                    it('should use last color for the remaining categories', () => {
                        const r = ramp(buckets('Madrid', CATEGORIES), palettes.PRISM);

                        r._bindMetadata(METADATA);
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

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = hexToRgb(RAMP_COLORS[3]);

                        expect(actual).not.toEqual(expected);
                    });

                    it('should not set the last ramp color to the last category', () => {
                        const r = ramp(buckets('Zaragoza', CATEGORIES), palettes.PRISM);

                        r._bindMetadata(METADATA);
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

                            r._bindMetadata(METADATA);
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

                        r._bindMetadata(METADATA);
                        actual = r.eval();
                        expected = hexToRgb(RAMP_COLORS[0]);

                        expect(actual).toEqual(expected);

                        r = ramp(buckets(10, CATEGORIES), palettes.BURG);

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
                        r._bindMetadata(METADATA);

                        actual = r.eval({ price: 1 });
                        expected = red.color;

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 2.1 });
                        expected = blue.color;

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 3.1 });
                        expected = yellow.color;

                        expect(actual).not.toEqual(expected);
                    });
                });

                describe('and there are the same number of categories than colors', () => {
                    it('should not show interpolation', () => {
                        const q = globalQuantiles($price, 4);
                        const r = ramp(q, [red, blue, yellow]);
                        r._bindMetadata(METADATA);

                        actual = r.eval({ price: 1 });
                        expected = red.color;

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 2.1 });
                        expected = blue.color;

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 3.1 });
                        expected = yellow.color;

                        expect(actual).toEqual(expected);
                    });
                });

                describe('and there are more categories than colors', () => {
                    it('should show interpolation', () => {
                        const q = globalQuantiles($price, 3);
                        const r = ramp(q, [red, blue]);
                        r._bindMetadata(METADATA);

                        actual = r.eval({ price: 1 });
                        expected = red.color;

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 3 });
                        expected = blue.color;

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
                        expected = red.color;

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 2.1 });
                        expected = blue.color;

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 3.1 });
                        expected = yellow.color;

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 4.1 });
                        expected = purple.color;

                        expect(actual).not.toEqual(expected);
                    });
                });

                describe('and it does not use linear expression', () => {
                    it('should show interpolation', () => {
                        const q = $price;
                        const r = ramp(q, [red, blue, yellow, purple, green]);
                        r._bindMetadata(METADATA);

                        actual = r.eval({ price: 1 });
                        expected = red.color;

                        expect(actual).toEqual(expected);

                        actual = r.eval({ price: 2.1 });
                        expected = blue.color;

                        expect(actual).not.toEqual(expected);

                        actual = r.eval({ price: 3.1 });
                        expected = yellow.color;

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

                describe('and there more than 7 colors', () => {
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
                const fakeGL = {uniform1f: () => {}, uniform1i: () => {}};
                const fakeDrawMetadata = {zoomLevel: 0};
                r._preDraw(null, fakeDrawMetadata, fakeGL);
                const actual = r.eval();
                expect(actual).toEqual(100);
            });

            it('should return an interpolated number in the array at a intermediate zoom level', () => {
                const r = ramp(zoomrange([3, 9]), [100, 200]);
                r._bindMetadata(METADATA);
                const fakeGL = {uniform1f: () => {}, uniform1i: () => {}};
                // See zoomrange() implementation to know more about how we create `fakeDrawMetadata`
                const fakeDrawMetadata = {zoomLevel: Math.log2(Math.pow(2, 3) * 0.7 + 0.3 * Math.pow(2, 9))};
                r._preDraw(null, fakeDrawMetadata, fakeGL);
                const actual = r.eval();
                expect(actual).toEqual(130);
            });

            it('should return the last number in the array at high zoom levels', () => {
                const r = ramp(zoomrange([3, 9]), [100, 200]);
                r._bindMetadata(METADATA);
                const fakeGL = {uniform1f: () => {}, uniform1i: () => {}};
                const fakeDrawMetadata = {zoomLevel: 100};
                r._preDraw(null, fakeDrawMetadata, fakeGL);
                const actual = r.eval();
                expect(actual).toEqual(200);
            });
        });
    });

    describe('.getLegend', () => {
        describe('when it is a linear input', () => {
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

            const red = namedColor('red');
            const blue = namedColor('blue');
            const yellow = namedColor('yellow');
            const $price = property('price');
            let actual;
            let expected;

            it('should return the value in ranges', () => {
                const r = ramp(linear($price), [red, blue, yellow]);

                r._bindMetadata(METADATA);

                actual = r.getLegend().data.length;
                expected = 11;
                expect(actual).toEqual(expected);
            });

            it('should return the value in ranges with custom configuration', () => {
                const r = ramp(linear($price), [red, blue, yellow]);

                r._bindMetadata(METADATA);

                actual = r.getLegend({ samples: 20 }).data.length;
                expected = 21;
                expect(actual).toEqual(expected);
            });
        });

        describe('when palette is a color array', () => {
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

            it('should return the value and the color for each category', () => {
                const r = ramp(buckets($grade, ['A', 'B', 'C']), imageList([BICYCLE, CAR, BUILDING]));

                r._bindMetadata(METADATA);

                actual = r.getLegend().data;
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
                    }
                ];

                expect(actual).toEqual(expected);
            });
        });

        describe('when palette is an image array', () => {
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

            const red = namedColor('red');
            const blue = namedColor('blue');
            const yellow = namedColor('yellow');

            let actual;
            let expected;
            let $grade = property('grade');

            it('should return the value and the image url for each category', () => {
                const r = ramp(buckets($grade, ['A', 'B', 'C']), [red, blue, yellow]);

                r._bindMetadata(METADATA);

                actual = r.getLegend().data;
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
                    }
                ];

                expect(actual).toEqual(expected);
            });
        });
    });

    describe('when the color ramp has an animated expression', () => {
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

        let r;

        beforeEach(() => {
            r = ramp(buckets('A', ['A', 'B', 'C']), [ rgb(0, 0, sin(now())) ]);
            r._bindMetadata(METADATA);
            r.eval({ price: 1 });
        });

        describe('._computeColorRampTexture', () => {
            it('should recalculate palette values', () => {
                spyOn(r, '_calcPaletteValues').and.callThrough();

                r._computeColorRampTexture();
                expect(r._calcPaletteValues).toHaveBeenCalled();
            });
        });

        describe('._computeTextureIfNeeded', () => {
            it('should calculate texture pixels', () => {
                spyOn(r, '_computeColorRampTexture').and.callThrough();

                r._computeTextureIfNeeded();
                expect(r._computeColorRampTexture).toHaveBeenCalled();
            });
        });

        describe('._computeGLTextureIfNeeded', () => {
            it('should create a new texture', () => {
                const gl = { createTexture () {} };
                spyOn(gl, 'createTexture');
                spyOn(r, '_bindGLTexture');

                r._computeGLTextureIfNeeded(gl);

                expect(gl.createTexture).toHaveBeenCalled();
                expect(r._bindGLTexture).toHaveBeenCalled();
            });
        });
    });

    describe('when the color ramp does not have an animated expression', () => {
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

        let r;

        beforeEach(() => {
            r = ramp(buckets('A', ['A', 'B', 'C']), [ rgb(0, 0, 0) ]);
            r._bindMetadata(METADATA);
            r.eval({ price: 1 });
        });

        describe('._computeColorRampTexture', () => {
            it('should not recalculate palette values', () => {
                spyOn(r, '_calcPaletteValues').and.callThrough();

                r._computeColorRampTexture();

                expect(r._calcPaletteValues).not.toHaveBeenCalled();
            });
        });

        describe('._computeTextureIfNeeded', () => {
            describe('and it has not calculated yet texture pixels', () => {
                it('should calculate texture pixels', () => {
                    spyOn(r, '_computeColorRampTexture').and.callThrough();

                    r._cachedTexturePixels = null;
                    r._computeTextureIfNeeded();

                    expect(r._computeColorRampTexture).toHaveBeenCalled();
                });
            });

            describe('and it has already calculated texture pixels', () => {
                it('should not calculate texture pixels', () => {
                    spyOn(r, '_computeColorRampTexture').and.callThrough();

                    r._computeTextureIfNeeded();
                    r._computeTextureIfNeeded();

                    expect(r._computeColorRampTexture).not.toHaveBeenCalled();
                });
            });
        });

        describe('._computeGLTextureIfNeeded', () => {
            it('should not create a new texture', () => {
                const gl = { createTexture () {} };
                spyOn(gl, 'createTexture');
                spyOn(r, '_bindGLTexture');

                r._computeGLTextureIfNeeded(gl);
                r._computeGLTextureIfNeeded(gl);

                expect(gl.createTexture).toHaveBeenCalledTimes(1);
                expect(r._bindGLTexture).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('._getColorValue', () => {
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

        const firstColor = namedColor('red');
        const secondColor = namedColor('blue');
        const thirdColor = namedColor('green');
        let actual;
        let expected;

        it('should get the first element if m is NaN', () => {
            const r = ramp(0, [firstColor, secondColor, thirdColor]);

            r._bindMetadata(METADATA);
            const texturePixels = r._computeTextureIfNeeded();
            actual = r._getColorValue(texturePixels, NaN);
            expected = firstColor.color;

            expect(actual).toEqual(expected);
        });

        it('should get the last element if m is Positive Infinity', () => {
            const r = ramp(0, [firstColor, secondColor, thirdColor]);

            r._bindMetadata(METADATA);
            const texturePixels = r._computeTextureIfNeeded();
            actual = r._getColorValue(texturePixels, Number.POSITIVE_INFINITY);
            expected = thirdColor.color;

            expect(actual).toEqual(expected);
        });

        it('should get the first element if m is Negative Infinity', () => {
            const r = ramp(0, [firstColor, secondColor, thirdColor]);

            r._bindMetadata(METADATA);
            const texturePixels = r._computeTextureIfNeeded();
            actual = r._getColorValue(texturePixels, Number.NEGATIVE_INFINITY);
            expected = firstColor.color;

            expect(actual).toEqual(expected);
        });

        it('should get the last element if m is a positive number greater than 1', () => {
            const r = ramp(0, [firstColor, secondColor, thirdColor]);

            r._bindMetadata(METADATA);
            const texturePixels = r._computeTextureIfNeeded();
            actual = r._getColorValue(texturePixels, 100);
            expected = thirdColor.color;

            expect(actual).toEqual(expected);
        });

        it('should get the current element if m is between 0 and 1', () => {
            const r = ramp(0, [firstColor, secondColor, thirdColor]);

            r._bindMetadata(METADATA);
            const texturePixels = r._computeTextureIfNeeded();
            actual = r._getColorValue(texturePixels, 0.5);
            expected = firstColor.color;

            expect(actual.r).not.toEqual(NaN);
            expect(actual.g).not.toEqual(NaN);
            expect(actual.b).not.toEqual(NaN);
            expect(actual.a).not.toEqual(NaN);
        });
    });
});
