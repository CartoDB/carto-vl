import { setDefaultAuth, getDefaultAuth, checkAuth, cleanDefaultAuth } from '../../../src/setup/auth-service';
import { CartoValidationTypes as cvt } from '../../../src/errors/carto-validation-error';

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
            }).toThrowError(cvt.MISSING_REQUIRED + ' \'auth\'');

            expect(function () {
                checkAuth(1234);
            }).toThrowError(cvt.INCORRECT_TYPE + ' \'auth\' property must be an object.');
        });

        it('should throw an error if auth.apiKey is not valid', function () {
            expect(function () {
                checkAuth({});
            }).toThrowError(cvt.MISSING_REQUIRED + ' \'apiKey\'');

            expect(function () {
                checkAuth({ apiKey: 1234 });
            }).toThrowError(cvt.INCORRECT_TYPE + ' \'apiKey\' property must be a string.');

            expect(function () {
                checkAuth({ apiKey: '' });
            }).toThrowError(cvt.INCORRECT_VALUE + ' \'apiKey\' property must be not empty.');
        });

        it('should throw an error if auth.username is not valid', function () {
            expect(function () {
                checkAuth({ apiKey: '123456789' });
            }).toThrowError(cvt.MISSING_REQUIRED + ' \'username\'');

            expect(function () {
                checkAuth({ user: 1234, apiKey: '123456789' });
            }).toThrowError(cvt.INCORRECT_TYPE + ' \'username\' property must be a string.');

            expect(function () {
                checkAuth({ user: '', apiKey: '123456789' });
            }).toThrowError(cvt.INCORRECT_VALUE + ' \'username\' property must be not empty.');
        });
    });

    // Reset global state to prevent errors in different tests
    afterAll(() => {
        cleanDefaultAuth(undefined);
    });
});
