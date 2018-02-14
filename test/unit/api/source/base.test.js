import SourceBase from '../../../../src/api/source/base';

describe('api/source/base', () => {
    const auth = {
        user: 'test',
        apiKey: '1234567890'
    };
    const options = {
        serverURL: 'https://{user}.test.com'
    };
    const source = new SourceBase();

    describe('constructor', () => {
        it('should build a new Source', () => {
            const source = new SourceBase();
            expect(source._client).toBeDefined();
        });
    });

    describe('.initialize', () => {
        it('should initialize the source with (auth, options)', () => {
            const source = new SourceBase();
            source.initialize(auth, options);
            expect(source._username).toEqual('test');
            expect(source._apiKey).toEqual('1234567890');
            expect(source._serverURL).toEqual('https://test.test.com');
            expect(source._client).toBeDefined();
        });

        it('should build a new Source with (auth) and default options', () => {
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
            }).toThrowError('`auth` property is required.');
            expect(function () {
                source.initialize(1234);
            }).toThrowError('`auth` property must be an object.');
        });

        it('should throw an error if auth.apiKey is not valid', function () {
            expect(function () {
                source.initialize({});
            }).toThrowError('`apiKey` property is required.');
            expect(function () {
                source.initialize({ apiKey: 1234 });
            }).toThrowError('`apiKey` property must be a string.');
            expect(function () {
                source.initialize({ apiKey: '' });
            }).toThrowError('`apiKey` property must be not empty.');
        });

        it('should throw an error if auth.username is not valid', function () {
            expect(function () {
                source.initialize({ apiKey: '123456789' });
            }).toThrowError('`username` property is required.');
            expect(function () {
                source.initialize({ user: 1234, apiKey: '123456789' });
            }).toThrowError('`username` property must be a string.');
            expect(function () {
                source.initialize({ user: '', apiKey: '123456789' });
            }).toThrowError('`username` property must be not empty.');
        });

        it('should throw an error if options are not valid', function () {
            expect(function () {
                source.initialize(auth, 1234);
            }).toThrowError('`options` property must be an object.');
        });

        it('should throw an error if options.serverURL is not valid', function () {
            expect(function () {
                source.initialize(auth, { serverURL: 1234 });
            }).toThrowError('`serverURL` property must be a string.');
            expect(function () {
                source.initialize(auth, { serverURL: 'momomo' });
            }).toThrowError('`serverURL` property is not a valid URL.');
        });
    });

    describe('.bindLayer', () => {

    });

    describe('.requrestData', () => {

    });
});
