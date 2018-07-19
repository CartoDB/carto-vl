import * as f from '../../../src/client/windshaft-filtering';
import { Viz, expressions as s } from '../../../src/index';

function preFilters (f, vizFilter) {
    const viz = (vizFilter === undefined) ? new Viz() : new Viz({ filter: vizFilter });
    return f.getFiltering(viz).preaggregation;
}

function aggrFilters (f, vizFilter) {
    const viz = (vizFilter === undefined) ? new Viz() : new Viz({ filter: vizFilter });
    return f.getFiltering(viz, { exclusive: false }).aggregation;
}

function aggrFiltersExclusive (f, vizFilter) {
    const viz = (vizFilter === undefined) ? new Viz() : new Viz({ filter: vizFilter });
    return f.getFiltering(viz, { exclusive: true }).aggregation;
}

function preSQL (f, preFilters) {
    return f.getSQLWhere({ preaggregation: preFilters });
}

describe('src/client/windshaft-filtering', () => {
    describe('getSQLWhere', () => {
        describe('when the filter does not exists', () => {
            it('should return an empty string', () => {
                expect(preSQL(f, null)).toEqual('');
            });
        });

        describe('when the filter does exists', () => {
            it('should return a BETWEEN clause with a between() filter', () => {
                expect(preSQL(f, {
                    type: 'between',
                    property: 'numeric_property',
                    lower: 10,
                    upper: 20
                })).toEqual('WHERE (numeric_property BETWEEN 10 AND 20)');
            });

            it('non-lowercase properties must be quoted', () => {
                expect(preSQL(f, {
                    type: 'between',
                    property: 'numericProperty',
                    lower: 10,
                    upper: 20
                })).toEqual('WHERE ("numericProperty" BETWEEN 10 AND 20)');
            });

            it('quotes in identifiers should be handled properly', () => {
                expect(preSQL(f, {
                    type: 'between',
                    property: 'weird"property',
                    lower: 10,
                    upper: 20
                })).toEqual('WHERE ("weird""property" BETWEEN 10 AND 20)');
            });

            it('should return a IN clause with an in() filter', () => {
                expect(preSQL(f, {
                    type: 'in',
                    property: 'categoricalProperty',
                    values: ['red', 'blue']
                })).toEqual('WHERE ("categoricalProperty" IN (\'red\',\'blue\'))');
            });

            it('should return a NOT IN clause with an nin() filter', () => {
                expect(preSQL(f, {
                    type: 'notIn',
                    property: 'categoricalProperty',
                    values: ['red', 'blue']
                })).toEqual('WHERE ("categoricalProperty" NOT IN (\'red\',\'blue\'))');
            });

            it('should AND sub-filter with non-unary filters', () => {
                expect(preSQL(f,
                    {
                        type: 'and',
                        left: {
                            type: 'in',
                            property: 'categoricalProperty',
                            values: ['red', 'blue']
                        },
                        right: {
                            type: 'between',
                            property: 'numericProperty',
                            lower: 10,
                            upper: 20
                        }
                    }
                )).toEqual('WHERE (("categoricalProperty" IN (\'red\',\'blue\')) AND ("numericProperty" BETWEEN 10 AND 20))');
            });

            it('should OR sub-filter with non-unary filters', () => {
                expect(preSQL(f,
                    {
                        type: 'or',
                        left: {
                            type: 'in',
                            property: 'categoricalProperty',
                            values: ['red', 'blue']
                        },
                        right: {
                            type: 'between',
                            property: 'numericProperty',
                            lower: 10,
                            upper: 20
                        }
                    }
                )).toEqual('WHERE (("categoricalProperty" IN (\'red\',\'blue\')) OR ("numericProperty" BETWEEN 10 AND 20))');
            });

            it('should handle single quotes in text literals', () => {
                expect(preSQL(f, {
                    type: 'in',
                    property: 'airport',
                    values: ['O\'Hare']
                })).toEqual('WHERE (airport IN (\'O\'\'Hare\'))');
            });
        });
    });

    describe('getFiltering pre-aggregation', () => {
        describe('when the filter is complete and exists', () => {
            it('between($numericProperty,10,20)', () => {
                const expected = {
                    type: 'between',
                    property: 'numericProperty',
                    lower: 10,
                    upper: 20
                };
                const actual = preFilters(f,
                    s.between(s.property('numericProperty'), 10, 20)
                );
                expect(actual).toEqual(expected);
            });

            it('between($numericProperty,10,20) with constantFloats', () => {
                const expected = {
                    type: 'between',
                    property: 'numericProperty',
                    lower: 10,
                    upper: 20
                };
                const actual = preFilters(f,
                    s.between(s.property('numericProperty'), s.constant(10), 20)
                );
                expect(actual).toEqual(expected);
            });

            it('in($categoricalProperty, [\'red\', \'blue\'])', () => {
                const expected = {
                    type: 'in',
                    property: 'categoricalProperty',
                    values: ['red', 'blue']
                };
                const actual = preFilters(f,
                    s.in(s.property('categoricalProperty'), ['red', 'blue'])
                );
                expect(actual).toEqual(expected);
            });

            it('nin($categoricalProperty, [\'red\', \'blue\'])', () => {
                const expected = {
                    type: 'notIn',
                    property: 'categoricalProperty',
                    values: ['red', 'blue']
                };
                const actual = preFilters(f,
                    s.nin(s.property('categoricalProperty'), ['red', 'blue'])
                );
                expect(actual).toEqual(expected);
            });

            it('$property<10', () => {
                const expected = {
                    type: 'lessThan',
                    left: {
                        type: 'property',
                        property: 'property'
                    },
                    right: {
                        type: 'value',
                        value: 10
                    }
                };
                expect(preFilters(f,
                    s.lt(s.property('property'), 10)
                )).toEqual(expected);
            });

            it('10<$property', () => {
                const expected = {
                    type: 'lessThan',
                    right: {
                        type: 'property',
                        property: 'property'
                    },
                    left: {
                        type: 'value',
                        value: 10
                    }
                };
                expect(preFilters(f,
                    s.lt(10, s.property('property'))
                )).toEqual(expected);
            });

            it('$property1<$property2', () => {
                const expected = {
                    type: 'lessThan',
                    left: {
                        type: 'property',
                        property: 'property1'
                    },
                    right: {
                        type: 'property',
                        property: 'property2'
                    }
                };
                expect(preFilters(f,
                    s.lt(s.property('property1'), s.property('property2'))
                )).toEqual(expected);
            });

            it('$property==5', () => {
                const expected = {
                    type: 'equals',
                    left: {
                        type: 'property',
                        property: 'property'
                    },
                    right: {
                        type: 'value',
                        value: 5
                    }
                };
                expect(preFilters(f,
                    s.eq(s.property('property'), 5)
                )).toEqual(expected);
            });

            it('$property1==5 and $property2==5`', () => {
                const expected = {
                    type: 'and',
                    left: {
                        type: 'equals',
                        left: {
                            type: 'property',
                            property: 'property1'
                        },
                        right: {
                            type: 'value',
                            value: 5
                        }
                    },
                    right: {
                        type: 'equals',
                        left: {
                            type: 'property',
                            property: 'property2'
                        },
                        right: {
                            type: 'value',
                            value: 5
                        }
                    }
                };
                expect(preFilters(f,
                    s.and(
                        s.eq(s.property('property1'), 5),
                        s.eq(s.property('property2'), 5)
                    )
                )).toEqual(expected);
            });

            it('between($numericProperty,10,20) and ($numericProperty < 100 or in($categoricalProperty, [\'red\', \'blue\']))', () => {
                const expected = {
                    type: 'and',
                    left: {
                        type: 'between',
                        property: 'numericProperty',
                        lower: 10,
                        upper: 20
                    },
                    right: {
                        type: 'or',
                        left: {
                            type: 'lessThan',
                            left: {
                                type: 'property',
                                property: 'numericProperty'
                            },
                            right: {
                                type: 'value',
                                value: 100
                            }
                        },
                        right: {
                            type: 'in',
                            property: 'categoricalProperty',
                            values: ['red', 'blue']
                        }
                    }
                };
                const actual = preFilters(f,
                    s.and(
                        s.between(s.property('numericProperty'), 10, 20),
                        s.or(
                            s.lt(s.property('numericProperty'), 100),
                            s.in(s.property('categoricalProperty'), ['red', 'blue'])
                        )
                    )
                );
                expect(actual).toEqual(expected);
            });
        });

        describe('when the filter is partial', () => {
            describe('partial AND should be filtered', () => {
                it('between($numericProperty,10,20) and $numericProperty<now()', () => {
                    const expected = {
                        type: 'between',
                        property: 'numericProperty',
                        lower: 10,
                        upper: 20
                    };
                    const actual = preFilters(f,
                        s.and(
                            s.between(s.property('numericProperty'), 10, 20),
                            s.lt(s.property('numericProperty'), s.now())
                        )
                    );
                    expect(actual).toEqual(expected);
                });

                it('$numericProperty<now() and between($numericProperty,10,20)', () => {
                    const expected = {
                        type: 'between',
                        property: 'numericProperty',
                        lower: 10,
                        upper: 20
                    };
                    const actual = preFilters(f,
                        s.and(
                            s.lt(s.property('numericProperty'), s.now()),
                            s.between(s.property('numericProperty'), 10, 20)
                        )
                    );
                    expect(actual).toEqual(expected);
                });
            });

            describe('partial OR should not be filtered', () => {
                it('between($numericProperty,10,20) or $numericProperty<now()', () => {
                    const actual = preFilters(f,
                        s.or(
                            s.between(s.property('numericProperty'), 10, 20),
                            s.lt(s.property('numericProperty'), s.now())
                        )
                    );
                    expect(actual).toBeNull();
                });

                it('$numericProperty<now() or between($numericProperty,10,20)', () => {
                    const actual = preFilters(f,
                        s.or(
                            s.lt(s.property('numericProperty'), s.now()),
                            s.between(s.property('numericProperty'), 10, 20)
                        )
                    );
                    expect(actual).toBeNull();
                });

                it('($numericProperty<now() or between($numericProperty, 100,200)) and between($numericProperty,10,20)', () => {
                    const expected = {
                        type: 'between',
                        property: 'numericProperty',
                        lower: 10,
                        upper: 20
                    };
                    const actual = preFilters(f,
                        s.and(
                            s.or(
                                s.lt(s.property('numericProperty'), s.now()),
                                s.between(s.property('numericProperty'), 100, 200)
                            ),
                            s.between(s.property('numericProperty'), 10, 20)
                        )
                    );
                    expect(actual).toEqual(expected);
                });
            });
        });

        describe('when the filter is a blend', () => {
            it('should skip the animation, applying the final filter, when the mix is an Animation', () => {
                const expected = {
                    type: 'between',
                    property: 'numericProperty',
                    lower: 10,
                    upper: 20
                };
                const actual = preFilters(f,
                    s.blend(
                        s.FALSE,
                        s.between(s.property('numericProperty'), 10, 20),
                        s.transition(100)
                    )
                );
                expect(actual).toEqual(expected);
            });

            it('should return null when the mix factor is not an Animation', () => {
                const actual = preFilters(f,
                    s.blend(
                        s.between(s.property('numericProperty'), 10, 20),
                        s.FALSE,
                        0.5
                    )
                );
                expect(actual).toBeNull();
            });
        });

        describe('when the filter should return null', () => {
            it('with the default filter', () => {
                expect(preFilters(f)).toBeNull();
            });

            it('with the `filter: true`', () => {
                expect(preFilters(f, s.TRUE)).toBeNull();
            });

            it('with the `filter: $property<now()', () => {
                expect(preFilters(f,
                    s.lt(s.property('property'), s.now())
                )).toBeNull();
            });

            it('with the `filter: $property==now() and $property==now()`', () => {
                expect(preFilters(f,
                    s.and(
                        s.eq(s.property('property'), s.now()),
                        s.eq(s.property('property'), s.now())
                    )
                )).toBeNull();
            });

            it('with the `filter: between($property, 0w, now())`', () => {
                expect(preFilters(f,
                    s.between(s.property('property'), 0, s.now())
                )).toBeNull();
            });

            it('`between($numericProperty, 10,20) or nin($categoricalProperty, [\'red\', \'blue\']) `', () => {
                const expected = {
                    type: 'or',
                    left: {
                        type: 'between',
                        property: 'numericProperty',
                        lower: 10,
                        upper: 20
                    },
                    right: {
                        type: 'notIn',
                        property: 'categoricalProperty',
                        values: ['red', 'blue']
                    }
                };
                const actual = preFilters(f,
                    s.or(
                        s.between(s.property('numericProperty'), 10, 20),
                        s.nin(s.property('categoricalProperty'), ['red', 'blue'])
                    )
                );
                expect(actual).toEqual(expected);
            });

            it('with aggregate properties', () => {
                expect(preFilters(f,
                    s.lt(s.clusterSum(s.property('property')), 10)
                )).toBeNull();
            });
        });
    });

    describe('getFiltering aggregation', () => {
        describe('when the filter is complete and exists', () => {
            it('between($numericProperty, 10, 20)', () => {
                const expected = {
                    numericProperty: [{
                        greater_than_or_equal_to: 10,
                        less_than_or_equal_to: 20
                    }]
                };
                const actual = aggrFilters(f,
                    s.between(s.property('numericProperty'), 10, 20)
                );
                expect(actual).toEqual(expected);
            });

            it('between(clusterAvg($numericProperty), 10, 20)', () => {
                const expected = {
                    _cdb_agg_avg_numericProperty: [{
                        greater_than_or_equal_to: 10,
                        less_than_or_equal_to: 20
                    }]
                };
                const actual = aggrFilters(f,
                    s.between(s.clusterAvg(s.property('numericProperty')), 10, 20)
                );
                expect(actual).toEqual(expected);
            });

            it('`between($numericProperty, 10,20) with constantFloats`', () => {
                const expected = {
                    numericProperty: [{
                        greater_than_or_equal_to: 10,
                        less_than_or_equal_to: 20
                    }]
                };
                const actual = aggrFilters(f,
                    s.between(s.property('numericProperty'), s.constant(10), 20)
                );
                expect(actual).toEqual(expected);
            });

            it('`in($categoricalProperty, [\'red\', \'blue\']) `', () => {
                const expected = {
                    categoricalProperty: [{
                        in: ['red', 'blue']
                    }]
                };
                const actual = aggrFilters(f,
                    s.in(s.property('categoricalProperty'), ['red', 'blue'])
                );
                expect(actual).toEqual(expected);
            });

            it('`nin($categoricalProperty, [\'red\', \'blue\']) `', () => {
                const expected = {
                    categoricalProperty: [{
                        not_in: ['red', 'blue']
                    }]
                };
                const actual = aggrFilters(f,
                    s.nin(s.property('categoricalProperty'), ['red', 'blue'])
                );
                expect(actual).toEqual(expected);
            });

            it('$property<10', () => {
                const expected = {
                    property: [{
                        less_than: 10
                    }]
                };
                expect(aggrFilters(f,
                    s.lt(s.property('property'), 10)
                )).toEqual(expected);
            });

            it('10<$property', () => {
                const expected = {
                    property: [{
                        greater_than: 10
                    }]
                };
                expect(aggrFilters(f,
                    s.lt(10, s.property('property'))
                )).toEqual(expected);
            });

            it('$property==5', () => {
                const expected = {
                    property: [{
                        equal: 5
                    }]
                };
                expect(aggrFilters(f,
                    s.eq(s.property('property'), 5)
                )).toEqual(expected);
            });

            it('$property1==5 and $property2==5`', () => {
                const expected = {
                    property1: [{
                        equal: 5
                    }],
                    property2: [{
                        equal: 5
                    }]
                };
                expect(aggrFilters(f,
                    s.and(
                        s.eq(s.property('property1'), 5),
                        s.eq(s.property('property2'), 5)
                    )
                )).toEqual(expected);
            });

            it('between($prop1,10,20) and ($prop2=100 or 200=$prop2)', () => {
                const expected = {
                    prop1: [{
                        greater_than_or_equal_to: 10,
                        less_than_or_equal_to: 20
                    }],
                    prop2: [{ equal: 100 }, { equal: 200 }]
                };
                const actual = aggrFilters(f,
                    s.and(
                        s.between(s.property('prop1'), 10, 20),
                        s.or(
                            s.eq(s.property('prop2'), 100),
                            s.eq(200, s.property('prop2'))
                        )
                    )
                );
                expect(actual).toEqual(expected);
            });

            it('`between($prop1, 10,20) and ($prop2 < 100 and in($prop3, [\'red\', \'blue\']))`', () => {
                const expected = {
                    prop1: [{
                        greater_than_or_equal_to: 10,
                        less_than_or_equal_to: 20
                    }],
                    prop2: [{ less_than: 100 }],
                    prop3: [{ in: ['red', 'blue'] }]
                };
                const actual = aggrFilters(f,
                    s.and(
                        s.between(s.property('prop1'), 10, 20),
                        s.and(
                            s.lt(s.property('prop2'), 100),
                            s.in(s.property('prop3'), ['red', 'blue'])
                        )
                    )
                );
                expect(actual).toEqual(expected);
            });

            it('`($prop > 10 and $prop <= 100) and in($prop2, [\'red\', \'blue\']))`', () => {
                const expected = {
                    prop: [{
                        greater_than: 10,
                        less_than_or_equal_to: 100
                    }],
                    prop2: [{ in: ['red', 'blue'] }]
                };
                const actual = aggrFilters(f,
                    s.and(
                        s.and(
                            s.gt(s.property('prop'), 10),
                            s.lte(s.property('prop'), 100)
                        ),
                        s.in(s.property('prop2'), ['red', 'blue'])
                    )
                );
                expect(actual).toEqual(expected);
            });
        });

        describe('when the filter is partial', () => {
            describe('partial AND should be filtered', () => {
                it('`between($numericProperty, 10,20) and $numericProperty<now()`', () => {
                    const expected = {
                        numericProperty: [{
                            greater_than_or_equal_to: 10,
                            less_than_or_equal_to: 20
                        }]
                    };
                    const actual = aggrFilters(f,
                        s.and(
                            s.between(s.property('numericProperty'), 10, 20),
                            s.lt(s.property('numericProperty'), s.now())
                        )
                    );
                    expect(actual).toEqual(expected);
                });

                it('`$numericProperty<now() and between($numericProperty, 10,20)`', () => {
                    const expected = {
                        numericProperty: [{
                            greater_than_or_equal_to: 10,
                            less_than_or_equal_to: 20
                        }]
                    };
                    const actual = aggrFilters(f,
                        s.and(
                            s.lt(s.property('numericProperty'), s.now()),
                            s.between(s.property('numericProperty'), 10, 20)
                        )
                    );
                    expect(actual).toEqual(expected);
                });
            });

            describe('partial OR should not be filtered', () => {
                it('`between($numericProperty, 10,20) or $numericProperty<now()`', () => {
                    const actual = aggrFilters(f,
                        s.or(
                            s.between(s.property('numericProperty'), 10, 20),
                            s.lt(s.property('numericProperty'), s.now())
                        )
                    );
                    expect(actual).toEqual({});
                });

                it('`$numericProperty<now() or between($numericProperty, 10,20)`', () => {
                    const actual = aggrFilters(f,
                        s.or(
                            s.lt(s.property('numericProperty'), s.now()),
                            s.between(s.property('numericProperty'), 10, 20)
                        )
                    );
                    expect(actual).toEqual({});
                });

                it('`($numericProperty<now() or between($numericProperty, 100,200)) and between($numericProperty, 10,20)`', () => {
                    const expected = {
                        numericProperty: [{
                            greater_than_or_equal_to: 10,
                            less_than_or_equal_to: 20
                        }]
                    };
                    const actual = aggrFilters(f,
                        s.and(
                            s.or(
                                s.lt(s.property('numericProperty'), s.now()),
                                s.between(s.property('numericProperty'), 100, 200)
                            ),
                            s.between(s.property('numericProperty'), 10, 20)
                        )
                    );
                    expect(actual).toEqual(expected);
                });

                it('`between($numericProperty, 10,20) and ($numericProperty < 100 or in($categoricalProperty, [\'red\', \'blue\']))`', () => {
                    const expected = {
                        numericProperty: [{
                            greater_than_or_equal_to: 10,
                            less_than_or_equal_to: 20
                        }]
                    };
                    const actual = aggrFilters(f,
                        s.and(
                            s.between(s.property('numericProperty'), 10, 20),
                            s.or(
                                s.lt(s.property('numericProperty'), 100),
                                s.in(s.property('categoricalProperty'), ['red', 'blue'])
                            )
                        )
                    );
                    expect(actual).toEqual(expected);
                });
            });
        });

        describe('when the filter is a blend', () => {
            it('should skip the animation, applying the final filter, when the mix is an Animation', () => {
                const expected = {
                    numericProperty: [{
                        greater_than_or_equal_to: 10,
                        less_than_or_equal_to: 20
                    }]
                };
                const actual = aggrFilters(f,
                    s.blend(
                        s.FALSE,
                        s.between(s.property('numericProperty'), 10, 20),
                        s.transition(100)
                    )
                );
                expect(actual).toEqual(expected);
            });

            it('should return null when the mix factor is not an Animation', () => {
                const actual = aggrFilters(f,
                    s.blend(
                        s.between(s.property('numericProperty'), 10, 20),
                        s.FALSE,
                        0.5
                    )
                );
                expect(actual).toEqual({});
            });
        });

        describe('when the filter should return null', () => {
            it('ignores aggregations in exclusive mode', () => {
                const actual = aggrFiltersExclusive(f,
                    s.between(s.property('numericProperty'), 10, 20)
                );
                expect(actual).toEqual({});
            });

            it('$property1<$property2', () => {
                expect(aggrFilters(f,
                    s.lt(s.property('property1'), s.property('property2'))
                )).toEqual({});
            });

            it('`between($numericProperty, 10,20) and ($numericProperty < 100 and in($categoricalProperty, [\'red\', \'blue\']))`', () => {
                const actual = aggrFilters(f,
                    s.and(
                        s.between(s.property('numericProperty'), 10, 20),
                        s.and(
                            s.lt(s.property('numericProperty'), 100),
                            s.in(s.property('categoricalProperty'), ['red', 'blue'])
                        )
                    )
                );
                expect(actual).toEqual({});
            });

            it('`between($numericProperty, 10,20) or ($numericProperty < 100 or in($categoricalProperty, [\'red\', \'blue\']))`', () => {
                const actual = aggrFilters(f,
                    s.or(
                        s.between(s.property('numericProperty'), 10, 20),
                        s.or(
                            s.lt(s.property('numericProperty'), 100),
                            s.in(s.property('categoricalProperty'), ['red', 'blue'])
                        )
                    )
                );
                expect(actual).toEqual({});
            });

            it('with the default filter', () => {
                expect(aggrFilters(f)).toEqual({});
            });

            it('with the `filter: true`', () => {
                expect(aggrFilters(f, s.TRUE)).toEqual({});
            });

            it('with the `filter: $property<now()', () => {
                expect(aggrFilters(f,
                    s.lt(s.property('property'), s.now())
                )).toEqual({});
            });

            it('with the `filter: $property==now() and $property==now()`', () => {
                expect(aggrFilters(f,
                    s.and(
                        s.eq(s.property('property'), s.now()),
                        s.eq(s.property('property'), s.now())
                    )
                )).toEqual({});
            });

            it('with the `filter: between($property, 0, now())`', () => {
                expect(aggrFilters(f,
                    s.between(s.property('property'), 0, s.now())
                )).toEqual({});
            });

            it('`between($numericProperty, 10,20) or nin($categoricalProperty, [\'red\', \'blue\']) `', () => {
                expect(aggrFilters(f,
                    s.or(
                        s.between(s.property('numericProperty'), 10, 20),
                        s.nin(s.property('categoricalProperty'), ['red', 'blue'])
                    )
                )).toEqual({});
            });
        });
    });
});
