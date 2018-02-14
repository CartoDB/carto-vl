import { setDefaultAuth, getDefaultAuth, checkAuth } from '../../../../src/api/setup/auth-service';

describe('api/setup/auth-service', () => {
    const auth = {
        user: 'test',
        apiKey: '1234567890'
    };

    describe('.getDefaultAuth and .setDefaultAuth', () => {
        it('should return undefined on init', () => {
            expect(getDefaultAuth()).toBeUndefined();
        });

        it('should return the last auth set', () => {
            setDefaultAuth(auth);
            expect(getDefaultAuth()).toEqual(auth);
        });
    });

    describe('.checkAuth', () => {
        it('should throw an error if auth is not valid', function () {
            expect(function () {
                checkAuth();
            }).toThrowError('`auth` property is required.');
            expect(function () {
                checkAuth(1234);
            }).toThrowError('`auth` property must be an object.');
        });

        it('should throw an error if auth.apiKey is not valid', function () {
            expect(function () {
                checkAuth({});
            }).toThrowError('`apiKey` property is required.');
            expect(function () {
                checkAuth({ apiKey: 1234 });
            }).toThrowError('`apiKey` property must be a string.');
            expect(function () {
                checkAuth({ apiKey: '' });
            }).toThrowError('`apiKey` property must be not empty.');
        });

        it('should throw an error if auth.username is not valid', function () {
            expect(function () {
                checkAuth({ apiKey: '123456789' });
            }).toThrowError('`username` property is required.');
            expect(function () {
                checkAuth({ user: 1234, apiKey: '123456789' });
            }).toThrowError('`username` property must be a string.');
            expect(function () {
                checkAuth({ user: '', apiKey: '123456789' });
            }).toThrowError('`username` property must be not empty.');
        });
    });
});
