import { parseStyleDefinition } from '../../../../src/core/style/parser';

describe('src/core/style/parser', () => {
    describe('and/or don\'t interfere with `ordering`', () => {
        it('`color: rgb(255,255,255) ordering: asc(width())` should not throw', () => {
            const str = 'color: rgb(255,255,255)\nordering: asc(width())';
            expect(() => parseStyleDefinition(str)).not.toThrow();
        });
    });
    describe('and/or are accepted', () => {
        it('`color: rgb(255,255,255)\nfilter: 1 or 0` should not throw', () => {
            const str = 'color: rgb(255,255,255)\nfilter: 1 or 0';
            expect(() => parseStyleDefinition(str)).not.toThrow();
        });
    });
});
