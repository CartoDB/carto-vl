/* eslint quotes: "off" */

import { parseVizDefinition, cleanComments } from '../../../../src/renderer/viz/parser';

describe('src/renderer/viz/parser', () => {
    // TODO: missing lots of tests here

    describe('.cleanComments', () => {
        it('should remove line comments without endline', () => {
            expect(cleanComments('width: 1// line comment')).toBe('width: 1');
        });

        it('should remove line comments with endline', () => {
            expect(cleanComments('width: 1// line comment\n')).toBe('width: 1\n');
        });

        it('should keep line comments inside single quotes', () => {
            expect(cleanComments("@var: '// line comment'")).toBe("@var: '// line comment'");
        });

        it('should keep line comments inside double quotes', () => {
            expect(cleanComments('@var: "// line comment"')).toBe('@var: "// line comment"');
        });

        it('should remove block comments without endline', () => {
            expect(cleanComments('width: 1/* block\ncomment */')).toBe('width: 1');
        });

        it('should remove block comments with endline', () => {
            expect(cleanComments('width: 1/* block\ncomment */\n')).toBe('width: 1\n');
        });

        it('should keep block comments inside single quotes', () => {
            expect(cleanComments("@var: '/* block\ncomment */'")).toBe("@var: '/* block\ncomment */'");
        });

        it('should keep block comments inside double quotes', () => {
            expect(cleanComments('@var: "/* block\ncomment */"')).toBe('@var: "/* block\ncomment */"');
        });

        it('should manage properly the escape chars for single quotes', () => {
            expect(cleanComments("@var: '\\' // comment'")).toBe("@var: '\\' // comment'");
            expect(cleanComments("@var: '\\\\' // comment")).toBe("@var: '\\\\' ");
            expect(cleanComments("@var: '\\\\\\' // comment'")).toBe("@var: '\\\\\\' // comment'");
            expect(cleanComments("@var: '\\\\\\\\' // comment")).toBe("@var: '\\\\\\\\' ");
        });

        it('should manage properly the escape chars for double quotes', () => {
            expect(cleanComments('@var: "\\" // comment"')).toBe('@var: "\\" // comment"');
            expect(cleanComments('@var: "\\\\" // comment"')).toBe('@var: "\\\\" ');
            expect(cleanComments('@var: "\\\\\\" // comment"')).toBe('@var: "\\\\\\" // comment"');
            expect(cleanComments('@var: "\\\\\\\\" // comment"')).toBe('@var: "\\\\\\\\" ');
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

    describe('AND/OR are accepted', () => {
        it('`color: rgb(255,255,255)\nfilter: 1 or 0` should not throw', () => {
            const str = 'color: rgb(255,255,255)\nfilter: 1 OR 0';
            expect(() => parseVizDefinition(str)).not.toThrow();
        });
    });

    describe('invalid identifier', () => {
        it('should throw an error', () => {
            expect(() => parseVizDefinition('width: wadus')).toThrow();
        });
    });

    describe('duplicated properties', () => {
        it('should throw an error', () => {
            expect(() => parseVizDefinition(`
                width: 1
                width: 2
            `)).toThrowError('Property \'width\' is already defined.');
        });
    });

    describe('duplicated variables', () => {
        it('should throw an error', () => {
            expect(() => parseVizDefinition(`
                @a: 1
                @a: 2
            `)).toThrowError('Variable \'a\' is already defined.');
        });
    });

    describe('built in images', () => {
        it('should be defined', () => {
            const str = `
                @1: bicycle
                @2: building
                @3: bus
                @4: car
                @5: circle
                @6: circle_outline
                @7: cross
                @8: flag
                @9: house
                @10: marker
                @11: marker_outline
                @12: plus
                @13: square
                @14: square_outline
                @15: star
                @16: star_outline
                @17: triangle
                @18: triangle_outline
            `;

            expect(() => parseVizDefinition(str)).not.toThrow();
        });
    });
});
