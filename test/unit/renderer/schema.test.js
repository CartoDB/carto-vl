import schema from '../../../src/renderer/schema';

describe('src/renderer/', () => {
    describe('schema', () => {
        it('different schemas shouldn\'t be equal', () => {
            const a = { columns: ['a', 'b'] };
            const b = { columns: ['a'] };
            expect(schema.equals(a, b)).toEqual(false);
        });
    });
    describe('schema', () => {
        it('alike schemas shouldn\'t be equal', () => {
            const a = { columns: ['a', 'b'] };
            const b = { columns: ['a', 'b'] };
            expect(schema.equals(a, b)).toEqual(true);
        });
    });
    describe('schema', () => {
        it('order of columns shouldn\'t matter', () => {
            const a = { columns: ['a', 'b'] };
            const b = { columns: ['b', 'a'] };
            expect(schema.equals(a, b)).toEqual(true);
        });
    });
});
