import * as s from '../../../../../src/core/style/functions';


// Add custom toString function to improve test output.
s.TRUE.toString = () => 's.TRUE';
s.FALSE.toString = () => 's.FALSE';

describe('src/core/style/expressions/binary', () => {
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


    let $cat = null;
    let $price = null;

    beforeEach(() => {
        // Needed a beforeEach to avoid testing against already compiled properties
        $cat = s.property('cat');
        $price = s.property('price');
    });

    describe('error control', () => {
        describe('Signature FLOATS_TO_FLOAT | FLOAT_AND_COLOR_TO_COLOR | COLORS_TO_COLOR', () => {
            it('mul(0, \'asd\') should throw at constructor time', () => {
                expect(() => s.mul(0, 'asd')).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
            });
            it('mul(\'asd\', \'red\') should throw at constructor time', () => {
                expect(() => s.mul('asd', 'red')).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
            });
            it('mul($cat, 1) should throw at compile time', () => {
                const mul = s.mul($cat, 1);
                expect(() => mul._compile(metadata)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
            });
        });

        describe('Signature FLOATS_TO_FLOAT | COLORS_TO_COLOR', () => {
            it('add(0, hsv(0,1,1)) should throw at constructor time', () => {
                expect(() => s.add(0, s.hsv(0, 1, 1))).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
            });
            it('add(hsv(0,1,1), 0) should throw at constructor time', () => {
                expect(() => s.add(s.hsv(0, 1, 1), 0)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
            });
            it('add(\'asd\', \'red\') should throw at constructor time', () => {
                expect(() => s.add('asd', 'red')).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
            });
        });

        describe('Signature FLOATS_TO_FLOAT', () => {
            it('mod(hsv(0,1,1), hsv(0,1,1)) should throw at constructor time', () => {
                expect(() => s.mod(s.hsv(0, 1, 1), s.hsv(0, 1, 1))).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
            });
            it('mod(0, hsv(0,1,1)) should throw at constructor time', () => {
                expect(() => s.mod(0, s.hsv(0, 1, 1))).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
            });
            it('mod(hsv(0,1,1), 0) should throw at constructor time', () => {
                expect(() => s.mod(s.hsv(0, 1, 1), 0)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
            });
            it('mod(\'asd\', \'red\') should throw at constructor time', () => {
                expect(() => s.mod('asd', 'red')).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
            });
        });

        describe('Signature FLOATS_TO_FLOAT | CATEGORIES_TO_FLOAT', () => {
            it('equals(hsv(0,1,1), hsv(0,1,1)) should throw at constructor time', () => {
                expect(() => s.equals(s.hsv(0, 1, 1), s.hsv(0, 1, 1))).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
            });
            it('equals(0, hsv(0,1,1)) should throw at constructor time', () => {
                expect(() => s.equals(0, s.hsv(0, 1, 1))).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
            });
            it('equals(hsv(0,1,1), 0) should throw at constructor time', () => {
                expect(() => s.equals(s.hsv(0, 1, 1), 0)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
            });
        });
    });

    describe('compile with correct parameters', () => {
        describe('Signature FLOATS_TO_FLOAT | FLOAT_AND_COLOR_TO_COLOR | COLORS_TO_COLOR', () => {
            it('mul($price, 1) should not throw', () => {
                expect(() => s.mul($price, 1)._compile(metadata)).not.toThrow();
            });
            it('mul(0.5, hsv(1,0,0)) should not throw', () => {
                expect(() => s.mul(0.5, s.hsv(0, 0, 0))._compile(metadata)).not.toThrow();
            });
            it('mul(hsv(1,0,0), hsv(1,$price,0)) should not throw', () => {
                expect(() => s.mul(s.hsv(1, 0, 0), s.hsv(0, $price, 0))._compile(metadata)).not.toThrow();
            });
        });

        describe('Signature FLOATS_TO_FLOAT | COLORS_TO_COLOR', () => {
            it('add($price, 1) should not throw', () => {
                expect(() => s.add($price, 1)._compile(metadata)).not.toThrow();
            });
            it('add(hsv(1,0,0), hsv(1,$price,0)) should not throw', () => {
                expect(() => s.add(s.hsv(1, 0, 0), s.hsv(0, $price, 0))._compile(metadata)).not.toThrow();
            });
        });

        describe('Signature FLOATS_TO_FLOAT', () => {
            it('mod($price, 1) should not throw', () => {
                expect(() => s.mod($price, 1)._compile(metadata)).not.toThrow();
            });
        });

        describe('Signature FLOATS_TO_FLOAT | CATEGORIES_TO_FLOAT', () => {
            it('equals($price, 1) should not throw', () => {
                expect(() => s.equals($price, 1)._compile(metadata)).not.toThrow();
            });
            it('equals($cat, \'red\') should not throw', () => {
                expect(() => s.equals($cat, 'red')._compile(metadata)).not.toThrow();
            });
        });
    });

    describe('compiled type', () => {
        it('Signature FLOATS_TO_FLOAT | FLOAT_AND_COLOR_TO_COLOR | COLORS_TO_COLOR', () => {
            expect(s.mul(s.hsv(1, 0, 0), 1).type).toEqual('color');
            expect(compile(s.mul(s.hsv(0, $price, 0), 1)).type).toEqual('color');

            expect(s.mul(3, 1).type).toEqual('float');
            expect(compile(s.mul($price, 1)).type).toEqual('float');

            expect(s.mul(s.hsv(1, 0, 0), s.hsv(0, 0, 0)).type).toEqual('color');
            expect(compile(s.mul(s.hsv(1, 0, 0), s.hsv(0, $price, 0))).type).toEqual('color');
        });
        it('Signature FLOATS_TO_FLOAT | COLORS_TO_COLOR', () => {
            expect(s.add(3, 1).type).toEqual('float');
            expect(compile(s.add($price, 1)).type).toEqual('float');

            expect(s.add(s.hsv(1, 0, 0), s.hsv(0, 0, 0)).type).toEqual('color');
            expect(compile(s.add(s.hsv(1, 0, 0), s.hsv(0, $price, 0))).type).toEqual('color');
        });
        it('Signature FLOATS_TO_FLOAT', () => {
            expect(s.mod(3, 1).type).toEqual('float');
            expect(compile(s.mod($price, 1)).type).toEqual('float');
        });
        it('Signature FLOATS_TO_FLOAT | CATEGORIES_TO_FLOAT', () => {
            expect(s.equals('asd', 'red').type).toEqual('float');
            expect(compile(s.equals($cat, 'red')).type).toEqual('float');
        });

    });

    describe('eval', () => {
        describe('and', () => {
            test('and', s.TRUE, s.TRUE, 1);
            test('and', s.TRUE, s.FALSE, 0);
            test('and', s.FALSE, s.FALSE, 0);
            test('and', 0.5, s.TRUE, 0.5);
            test('and', 0.5, 0.5, 0.25);
        });

        describe('or', () => {
            test('or', 0, 0, 0);
            test('or', 0, 1, 1);
            test('or', 1, 1, 1);
            test('or', 0.5, 1, 1);
        });

        describe('floatMul', () => {
            test('floatMul', 0, 0, 0);
            test('floatMul', 1, 0, 0);
            test('floatMul', 1, 1, 1);
            test('floatMul', 1, 2, 2);
            test('floatMul', -1, 2, -2);
        });

        describe('floatDiv', () => {
            it('floatdiv(1, 0) should return an error', () => expect(() => s.floatDiv(1, 0)).toThrow());
            test('floatDiv', 0, 1, 0);
            test('floatDiv', 4, 2, 2);
            test('floatDiv', -4, 2, -2);
        });

        describe('floatAdd', () => {
            test('floatAdd', 0, 0, 0);
            test('floatAdd', 0, 1, 1);
            test('floatAdd', 2, 2, 4);
            test('floatAdd', -2, 2, 0);
            test('floatAdd', -2, -3, -5);
        });

        describe('floatSub', () => {
            test('floatSub', 0, 0, 0);
            test('floatSub', 0, 1, -1);
            test('floatSub', 2, 2, 0);
            test('floatSub', -2, 2, -4);
            test('floatSub', -2, -3, 1);
        });

        describe('floatMod', () => {
            it('floatdiv(1, 0) should return an error', () => expect(() => s.floatMod(3, 0)).toThrow());
            test('floatMod', 0, 1, 0);
            test('floatMod', 2, 1, 0);
            test('floatMod', 2, 2, 0);
            test('floatMod', 6, 4, 2);
            test('floatMod', -6, 4, -2);
        });

        describe('floatPow', () => {
            test('floatPow', 0, 0, 1);
            test('floatPow', 0, 1, 0);
            test('floatPow', 2, 2, 4);
            test('floatPow', -2, 2, 4);
            test('floatPow', -2, -3, -0.125);
        });

        describe('gt', () => {
            test('gt', 0, 0, 0);
            test('gt', 0, 1, 0);
            test('gt', 1, 0, 1);
            test('gt', 2, 2, 0);
            test('gt', 2, 3, 0);
            test('gt', 3, 2, 1);
            test('gt', -3, 2, 0);
        });

        describe('gte', () => {
            test('gte', 0, 0, 1);
            test('gte', 0, 1, 0);
            test('gte', 1, 0, 1);
            test('gte', 2, 2, 1);
            test('gte', 2, 3, 0);
            test('gte', 3, 2, 1);
            test('gte', -3, 2, 0);
        });

        describe('lt', () => {
            test('lt', 0, 0, 0);
            test('lt', 0, 1, 1);
            test('lt', 1, 0, 0);
            test('lt', 2, 2, 0);
            test('lt', 2, 3, 1);
            test('lt', 3, 2, 0);
            test('lt', -3, 2, 1);
        });

        describe('lte', () => {
            test('lte', 0, 0, 1);
            test('lte', 0, 1, 1);
            test('lte', 1, 0, 0);
            test('lte', 2, 2, 1);
            test('lte', 2, 3, 1);
            test('lte', 3, 2, 0);
            test('lte', -3, 2, 1);
        });

        describe('eq', () => {
            test('eq', 0, 0, 1);
            test('eq', 0, 1, 0);
            test('eq', 1, 0, 0);
            test('eq', 2, 2, 1);
            test('eq', 2, 3, 0);
        });

        describe('neq', () => {
            test('neq', 0, 0, 0);
            test('neq', 0, 1, 1);
            test('neq', 1, 0, 1);
            test('neq', 2, 2, 0);
            test('neq', 2, 3, 1);
        });

        function test(fn, param1, param2, expected) {
            it(`${fn}(${param1}, ${param2}) should return ${expected}`, () => {
                const actual = s[fn](param1, param2).eval();
                expect(actual).toEqual(expected);
            });
        }
    });

    function compile(expression) {
        expression._compile(metadata);
        return expression;
    }
});


