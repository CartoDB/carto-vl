import Dataset from '../../../src/api/source/dataset';
import Style from '../../../src/api/style';
import Layer from '../../../src/api/layer';

describe('api/layer', () => {
    let source;
    let style;

    beforeEach(function () {
        source = new Dataset('ne_10m_populated_places_simple', {
            user: 'test',
            apiKey: '1234567890'
        });
        style = new Style();
    });

    describe('constructor', () => {
        it('should build a new Layer with (id, source, style)', () => {
            const layer = new Layer('layer0', source, style);
            expect(layer._id).toEqual('layer0');
            expect(layer._source).toEqual(source);
            expect(layer._style).toEqual(style);
        });

        it('should throw an error if id is not valid', function () {
            expect(function () {
                new Layer();
            }).toThrowError('`id` property required.');
            expect(function () {
                new Layer({});
            }).toThrowError('`id` property must be a string.');
            expect(function () {
                new Layer('');
            }).toThrowError('`id` property must be not empty.');
        });

        it('should throw an error if source is not valid', function () {
            expect(function () {
                new Layer('layer0');
            }).toThrowError('`source` property required.');
            expect(function () {
                new Layer('layer0', {});
            }).toThrowError('The given object is not a valid source. See "carto.source.Base".');
        });

        it('should throw an error if style is not valid', function () {
            expect(function () {
                new Layer('layer0', source);
            }).toThrowError('`style` property required.');
            expect(function () {
                new Layer('layer0', source, {});
            }).toThrowError('The given object is not a valid style. See "carto.Style".');
        });
    });

    describe('.setSource', () => {

    });

    describe('.setStyle', () => {

    });

    describe('.addTo', () => {

    });
});
