import SourceBase from '../../../src/sources/BaseWindshaft';
import { CartoValidationTypes as cvt } from '../../../src/errors/carto-validation-error';

describe('sources/base-windshaft', () => {
    const auth = {
        username: 'test',
        apiKey: '1234567890'
    };
    const config = {
        serverURL: 'https://{user}.test.com'
    };

    describe('constructor', () => {
        it('should build a new Source', () => {
            const source = new SourceBase();
            expect(source._client).toBeDefined();
        });
    });

    describe('.initialize', () => {
        const source = new SourceBase();
        it('should initialize the source with (auth, config)', () => {
            const source = new SourceBase();
            source.initialize(auth, config);

            expect(source._username).toEqual('test');
            expect(source._apiKey).toEqual('1234567890');
            expect(source._serverURL).toEqual('https://test.test.com');
            expect(source._client).toBeDefined();
        });

        it('should build a new Source with (auth) and default config', () => {
            const source = new SourceBase();
            source.initialize(auth);

            expect(source._username).toEqual('test');
            expect(source._apiKey).toEqual('1234567890');
            expect(source._serverURL).toEqual('https://test.carto.com');
            expect(source._client).toBeDefined();
        });

        it('should throw an error if auth is not valid', function () {
            expect(function () {
                source.initialize();
            }).toThrowError(cvt.MISSING_REQUIRED + ' \'auth\'');

            expect(function () {
                source.initialize(1234);
            }).toThrowError(cvt.INCORRECT_TYPE + ' \'auth\' property must be an object.');
        });

        it('should throw an error if auth.apiKey is not valid', function () {
            expect(function () {
                source.initialize({});
            }).toThrowError(cvt.MISSING_REQUIRED + ' \'apiKey\'');

            expect(function () {
                source.initialize({ apiKey: 1234 });
            }).toThrowError(cvt.INCORRECT_TYPE + ' \'apiKey\' property must be a string.');

            expect(function () {
                source.initialize({ apiKey: '' });
            }).toThrowError(cvt.INCORRECT_VALUE + ' \'apiKey\' property must be not empty.');
        });

        it('should throw an error if auth.username is not valid', function () {
            expect(function () {
                source.initialize({ apiKey: '123456789' });
            }).toThrowError(cvt.MISSING_REQUIRED + ' \'username\'');

            expect(function () {
                source.initialize({ username: 1234, apiKey: '123456789' });
            }).toThrowError(cvt.INCORRECT_TYPE + ' \'username\' property must be a string.');

            expect(function () {
                source.initialize({ username: '', apiKey: '123456789' });
            }).toThrowError(cvt.INCORRECT_VALUE + ' \'username\' property must be not empty.');
        });

        it('should throw an error if config are not valid', function () {
            expect(function () {
                source.initialize(auth, 1234);
            }).toThrowError(cvt.INCORRECT_TYPE + ' \'config\' property must be an object.');
        });
    });

    describe('.bindLayer', () => {

    });

    describe('.requrestData', () => {

    });
});
