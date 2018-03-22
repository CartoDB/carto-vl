import * as f from '../../../src/client/windshaft-filtering';
import Style from '../../../src/api/style';
import * as s from '../../../src/core/style/functions';

describe('src/client/windshaft-filtering', () => {
    describe('getSQLWhere', () => {
        describe('when the filter does not exists', () => {
            it('should return an empty string', () => {
                expect(f.getSQLWhere(null)).toEqual('');
            });
        });

        describe('when the filter does exists', () => {
            it('should return a BETWEEN clause with a between() filter', () => {
                expect(f.getSQLWhere({preaggregation: [{
                    type: 'between',
                    property: 'numericProperty',
                    lowerLimit: 10,
                    upperLimit: 20,
                }]})).toEqual('WHERE (numericProperty BETWEEN 10 AND 20)');
            });

            it('should return a IN clause with an in() filter', () => {
                expect(f.getSQLWhere({preaggregation: [{
                    type: 'in',
                    property: 'categoricalProperty',
                    whitelist: ['red', 'blue']
                }]})).toEqual('WHERE (categoricalProperty IN (\'red\',\'blue\'))');
            });

            it('should return a NOT IN clause with an nin() filter', () => {
                expect(f.getSQLWhere({preaggregation: [{
                    type: 'nin',
                    property: 'categoricalProperty',
                    blacklist: ['red', 'blue']
                }]})).toEqual('WHERE (categoricalProperty NOT IN (\'red\',\'blue\'))');
            });

            it('should compose sub-filter with non-unary filters', () => {
                expect(f.getSQLWhere({preaggregation: [
                    {
                        type: 'in',
                        property: 'categoricalProperty',
                        whitelist: ['red', 'blue']
                    },
                    {
                        type: 'between',
                        property: 'numericProperty',
                        lowerLimit: 10,
                        upperLimit: 20,
                    }
                ]})).toEqual('WHERE (categoricalProperty IN (\'red\',\'blue\')) AND (numericProperty BETWEEN 10 AND 20)');
            });
        });
    });

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
                expect(actual.preaggregation).toEqual(expected);
            });

            it('`between($numericProperty, 10,20) with constantFloats`', () => {
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
                expect(actual.preaggregation).toEqual(expected);
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
                expect(actual.preaggregation).toEqual(expected);
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
                expect(actual.preaggregation).toEqual(expected);
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
                expect(actual.preaggregation).toEqual(expected);
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
                expect(actual.preaggregation).toEqual(expected);
            });
        });

        describe('when the filter is a blend', () => {
            it('should skip the animation, applying the final filter, when the mix is an Animation', () => {
                const expected = [
                    {
                        type: 'between',
                        property: 'numericProperty',
                        lowerLimit: 10,
                        upperLimit: 20,
                    }
                ];
                const actual = f.getFiltering(new Style({
                    filter: s.blend(
                        s.FALSE,
                        s.between(s.property('numericProperty'), 10, 20),
                        s.animate(100)
                    )
                }));
                expect(actual.preaggregation).toEqual(expected);
            });

            it('should return null when the mix factor is not an Animation', () => {
                const actual = f.getFiltering(new Style({
                    filter: s.blend(
                        s.between(s.property('numericProperty'), 10, 20),
                        s.FALSE,
                        0.5
                    )
                }));
                expect(actual.preaggregation).toBeNull();
            });
        });

        describe('when the filter should return null', () => {
            it('with the default filter', () => {
                expect(f.getFiltering(new Style()).preaggregation).toBeNull();
            });

            it('with the `filter: true`', () => {
                expect(f.getFiltering(new Style({
                    filter: s.TRUE
                })).preaggregation).toBeNull();
            });

            it('with the `filter: $property==5 and $property==5`', () => {
                expect(f.getFiltering(new Style({
                    filter: s.and(
                        s.eq(s.property('property'), 5),
                        s.eq(s.property('property'), 5)
                    )
                })).preaggregation).toBeNull();
            });

            it('with the `filter: $property<10`', () => {
                expect(f.getFiltering(new Style({
                    filter: s.lt(s.property('property'), 10)
                })).preaggregation).toBeNull();
            });

            it('with the `filter: between($property, 0, now())`', () => {
                expect(f.getFiltering(new Style({
                    filter: s.between(s.property('property'), 0, s.now())
                })).preaggregation).toBeNull();
            });

            it('`between($numericProperty, 10,20) or nin($categoricalProperty, \'red\', \'blue\') `', () => {
                expect(f.getFiltering(new Style({
                    filter: s.or(
                        s.between(s.property('numericProperty'), 10, 20),
                        s.nin(s.property('categoricalProperty', 'red', 'blue'))
                    )
                })).preaggregation).toBeNull();
            });
        });
    });
});
