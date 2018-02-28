import * as f from '../../../src/client/windshaft-filtering';
import Style from '../../../src/api/style';
import * as s from '../../../src/core/style/functions';

describe('src/client/windshaft-filtering', () => {
    describe('getFiltering', () => {
        describe('when the filter is complete and exists', () => {
            it('`between($numericProperty, 10,20) `', () => {
                const expected = [
                    {
                        type: 'between',
                        property: 'numericProperty',
                        lowerLimit: 10,
                        upperLimit: 20,
                    }
                ];
                const actual = f.getFiltering(new Style({
                    filter: s.between(s.property('numericProperty'), 10, 20)
                }));
                expect(actual).toEqual(expected);
            });
            xit('`between($numericProperty, 10,20) with constantFloats`', () => {
                const expected = [
                    {
                        type: 'between',
                        property: 'numericProperty',
                        lowerLimit: 10,
                        upperLimit: 20,
                    }
                ];
                const actual = f.getFiltering(new Style({
                    filter: s.between(s.property('numericProperty'), s.floatConstant(10), 20)
                }));
                expect(actual).toEqual(expected);
            });
            it('`in($categoricalProperty, \'red\', \'blue\') `', () => {
                const expected = [
                    {
                        type: 'in',
                        property: 'categoricalProperty',
                        whitelist: ['red', 'blue']
                    }
                ];
                const actual = f.getFiltering(new Style({
                    filter: s.in(s.property('categoricalProperty'), 'red', 'blue')
                }));
                expect(actual).toEqual(expected);
            });
            it('`nin($categoricalProperty, \'red\', \'blue\') `', () => {
                const expected = [
                    {
                        type: 'nin',
                        property: 'categoricalProperty',
                        blacklist: ['red', 'blue']
                    }
                ];
                const actual = f.getFiltering(new Style({
                    filter: s.nin(s.property('categoricalProperty'), 'red', 'blue')
                }));
                expect(actual).toEqual(expected);
            });
        });

        describe('when the filter is partial', () => {
            it('`between($numericProperty, 10,20) and $numericProperty<now()`', () => {
                const expected = [
                    {
                        type: 'between',
                        property: 'numericProperty',
                        lowerLimit: 10,
                        upperLimit: 20,
                    }
                ];
                const actual = f.getFiltering(new Style({
                    filter: s.and(
                        s.between(s.property('numericProperty'), 10, 20),
                        s.lt(s.property('numericProperty'), s.now())
                    )
                }));
                expect(actual).toEqual(expected);
            });
            it('`$numericProperty<now() and between($numericProperty, 10,20)`', () => {
                const expected = [
                    {
                        type: 'between',
                        property: 'numericProperty',
                        lowerLimit: 10,
                        upperLimit: 20,
                    }
                ];
                const actual = f.getFiltering(new Style({
                    filter: s.and(
                        s.lt(s.property('numericProperty'), s.now()),
                        s.between(s.property('numericProperty'), 10, 20),
                    )
                }));
                expect(actual).toEqual(expected);
            });
        });

        describe('when the filter should return null', () => {
            it('with the default filter', () => {
                expect(f.getFiltering(new Style())).toBeNull();
            });

            it('with the `filter: true`', () => {
                expect(f.getFiltering(new Style({
                    filter: s.TRUE
                }))).toBeNull();
            });

            it('with the `filter: $property<10`', () => {
                expect(f.getFiltering(new Style({
                    filter: s.lt(s.property('property'), 10)
                }))).toBeNull();
            });

            it('with the `filter: between($property, 0, now())`', () => {
                expect(f.getFiltering(new Style({
                    filter: s.between(s.property('property'), 0, s.now())
                }))).toBeNull();
            });
            it('`between($numericProperty, 10,20) or nin($categoricalProperty, \'red\', \'blue\') `', () => {
                expect(f.getFiltering(new Style({
                    filter: s.or(
                        s.between(s.property('numericProperty'), 10, 20),
                        s.nin(s.property('categoricalProperty', 'red', 'blue'))
                    )
                }))).toBeNull();
            });
        });
    });
});
