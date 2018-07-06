import SourceBase from '../../../src/sources/BaseWindshaft';

describe('sources/base-windshaft', () => {
    const auth = {
        user: 'test',
        apiKey: '1234567890'
    };
    const config = {
        serverURL: 'https://{user}.test.com'
    };


    describe('constructor', () => {
        it('should build a new Source', () => {
            const source = new SourceBase();
            expect(source._windshaftClient).toBeDefined();
        });
    });

    describe('._initialize', () => {
        const source = new SourceBase();
        it('should initialize the source with (auth, config)', () => {
            const source = new SourceBase();
            source._initialize(auth, config);

            expect(source._username).toEqual('test');
            expect(source._apiKey).toEqual('1234567890');
            expect(source._serverURL).toEqual('https://test.test.com');
            expect(source._windshaftClient).toBeDefined();
        });

        it('should build a new Source with (auth) and default config', () => {
            const source = new SourceBase();
            source._initialize(auth);

            expect(source._username).toEqual('test');
            expect(source._apiKey).toEqual('1234567890');
            expect(source._serverURL).toEqual('https://test.carto.com');
            expect(source._windshaftClient).toBeDefined();
        });

        it('should throw an error if auth is not valid', function () {
            expect(function () {
                source._initialize();
            }).toThrowError('`auth` property is required.');
            expect(function () {
                source._initialize(1234);
            }).toThrowError('`auth` property must be an object.');
        });

        it('should throw an error if auth.apiKey is not valid', function () {
            expect(function () {
                source._initialize({});
            }).toThrowError('`apiKey` property is required.');
            expect(function () {
                source._initialize({ apiKey: 1234 });
            }).toThrowError('`apiKey` property must be a string.');
            expect(function () {
                source._initialize({ apiKey: '' });
            }).toThrowError('`apiKey` property must be not empty.');
        });

        it('should throw an error if auth.username is not valid', function () {
            expect(function () {
                source._initialize({ apiKey: '123456789' });
            }).toThrowError('`username` property is required.');
            expect(function () {
                source._initialize({ user: 1234, apiKey: '123456789' });
            }).toThrowError('`username` property must be a string.');
            expect(function () {
                source._initialize({ user: '', apiKey: '123456789' });
            }).toThrowError('`username` property must be not empty.');
        });

        it('should throw an error if config are not valid', function () {
            expect(function () {
                source._initialize(auth, 1234);
            }).toThrowError('`config` property must be an object.');
        });

        it('should throw an error if config.serverURL is not valid', function () {
            expect(function () {
                source._initialize(auth, { serverURL: 1234 });
            }).toThrowError('`serverURL` property must be a string.');
            expect(function () {
                source._initialize(auth, { serverURL: 'invalid-url' });
            }).toThrowError('`serverURL` property is not a valid URL.');
        });
    });

    describe('.bindLayer', () => {

    });

    describe('.requrestData', () => {

    });
});
