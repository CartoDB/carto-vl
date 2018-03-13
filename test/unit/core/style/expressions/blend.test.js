import * as s from '../../../../../src/core/style/functions';

describe('src/core/style/expressions/blend', () => {
    const metadata = {
        columns: [
            {
                name: 'price',
                type: 'float'
            },
            {
                name: 'cat',
                type: 'category',
                categoryNames: ['red', 'blue']
            }
        ],
    };

    function compile(expression) {
        expression._compile(metadata);
        return expression;
    }

    let $cat = null;
    let $price = null;

    beforeEach(() => {
        // Needed a beforeEach to avoid testing against already compiled properties
        $cat = s.property('cat');
        $price = s.property('price');
    });

    describe('error control', () => {
        it('blend(\'red\', 0, 0) should throw at constructor time', () => {
            expect(() => s.max(0)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
        });
        it('blend(0, \'red\', 0) should throw at constructor time', () => {
            expect(() => s.max(0)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
        });
        it('blend(0, 0, \'red\') should throw at constructor time', () => {
            expect(() => s.max(0)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
        });

        it('blend($cat, 0, 0) should throw at compile time', () => {
            expect(() => s.max(0)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
        });
        it('blend(0, $cat, 0) should throw at compile time', () => {
            expect(() => s.max(0)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
        });
        it('blend(0, 0, $cat) should throw at compile time', () => {
            expect(() => s.max(0)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
        });

        it('blend(0, hsv(0,0,0), 0) should throw at constructor time', () => {
            expect(() => s.max(0)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
        });
    });
    
    describe('compile with correct parameters', () => {
        it('blend(hsv(0,0,0), hsv(0,0,0), 0) should not throw', () => {
            expect(() => s.max(0)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
        });
        it('blend(3, 4, 0) should not throw', () => {
            expect(() => s.max(0)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
        });
    });
    
    describe('compiled type', () => {
        it('blend(hsv(0,0,0), hsv(0,0,0), 0) should be of type color', () => {
            expect(() => s.max(0)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
        });
        it('blend(3, 4, 0) should be of type float', () => {
            expect(() => s.max(0)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
        });
    });

    describe('eval()', () => {
        it('should interpolate a float value 0%', () => {
            const actual = s.blend(0, 100, 0).eval();
            expect(actual).toEqual(0);
        });

        it('should interpolate a float value 50%', () => {
            const actual = s.blend(0, 100, .5).eval();
            expect(actual).toEqual(50);
        });

        it('should interpolate a float value 100%', () => {
            const actual = s.blend(0, 100, 1).eval();
            expect(actual).toEqual(100);
        });
    });
});


