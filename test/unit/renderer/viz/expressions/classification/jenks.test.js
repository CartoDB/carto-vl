import jenks from '../../../../../../src/renderer/viz/expressions/classification/jenks';

describe('src/renderer/viz/expressions/classification/jenks', () => {
    const data = [1, 2, 3, 4, 5, 6, 7];

    it('returns null if series is empty', () => {
        const classification = jenks([], 2);
        expect(classification).toEqual(null);
    });

    it('gets breakpoints for a basic series', () => {
        expect(jenks(data, 1)).toEqual([1, 7]);
        expect(jenks(data, 2)).toEqual([1, 4, 7]);
    });

    it('returns null if number of classes exceeds data length', () => {
        const classification = jenks(data, 8);
        expect(classification).toEqual(null);
    });
});
