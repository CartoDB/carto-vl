import { parseVizDefinition, cleanComments } from '../../../../src/core/viz/parser';

describe('src/core/viz/parser', () => {

    // TODO: missing lots of tests here

    describe('.cleanComments', () => {
        it('should remove the one-line comments', () => {
            const str = 'width: 1// one-line comment';
            expect(cleanComments(str)).toBe('width: 1');
        });

        it('should remove the multi-line comments', () => {
            const str = 'width: 1/* multi-line \ncomment */\ncolor: blue';
            expect(cleanComments(str)).toBe('width: 1\ncolor: blue');
        });
    });

    describe('and/or don\'t interfere with `ordering`', () => {
        it('`color: rgb(255,255,255) ordering: asc(width())` should not throw', () => {
            const str = 'color: rgb(255,255,255)\nordering: asc(width())';
            expect(() => parseVizDefinition(str)).not.toThrow();
        });
    });

    describe('and/or are accepted', () => {
        it('`color: rgb(255,255,255)\nfilter: 1 or 0` should not throw', () => {
            const str = 'color: rgb(255,255,255)\nfilter: 1 or 0';
            expect(() => parseVizDefinition(str)).not.toThrow();
        });
    });
});
