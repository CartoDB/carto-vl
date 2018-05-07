import { parseVizDefinition, cleanComments } from '../../../../src/core/viz/parser';

describe('src/core/viz/parser', () => {

    // TODO: missing lots of tests here

    describe('.cleanComments', () => {
        it('should remove line comments without endline', () => {
            const str = 'width: 1// line comment';
            expect(cleanComments(str)).toBe('width: 1');
        });

        it('should remove line comments with endline', () => {
            const str = 'width: 1// line comment\n';
            expect(cleanComments(str)).toBe('width: 1\n');
        });

        it('should keep line comments inside simple quotes', () => {
            const str = '@var: \'// line comment\'';
            expect(cleanComments(str)).toBe('@var: \'// line comment\'');
        });

        it('should keep line comments inside simple quotes', () => {
            const str = '@var: "// line comment"';
            expect(cleanComments(str)).toBe('@var: "// line comment"');
        });

        it('should remove block comments without endline', () => {
            const str = 'width: 1/* block\ncomment */';
            expect(cleanComments(str)).toBe('width: 1');
        });

        it('should remove block comments with endline', () => {
            const str = 'width: 1/* block\ncomment */\n';
            expect(cleanComments(str)).toBe('width: 1\n');
        });

        it('should keep block comments inside simple quotes', () => {
            const str = '@var: \'/* block\ncomment */\'';
            expect(cleanComments(str)).toBe('@var: \'/* block\ncomment */\'');
        });

        it('should keep block comments inside simple quotes', () => {
            const str = '@var: "/* block\ncomment */"';
            expect(cleanComments(str)).toBe('@var: "/* block\ncomment */"');
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
