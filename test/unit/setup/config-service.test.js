import { setDefaultConfig, getDefaultConfig, checkConfig, cleanDefaultConfig } from '../../../src/setup/config-service';

describe('api/setup/config-service', () => {
    const config = {
        serverURL: 'https://{user}.test.com'
    };

    describe('.getDefaultConfig and .setDefaultConfig', () => {
        it('should return undefined on init', () => {
            expect(getDefaultConfig()).toBeUndefined();
        });

        it('should return the last config set', () => {
            setDefaultConfig(config);
            expect(getDefaultConfig()).toEqual(config);
        });
    });

    describe('.checkConfig', () => {
        it('should throw an error if config is not valid', function () {
            expect(function () {
                checkConfig(1234);
            }).toThrowError('`config` property must be an object.');
        });

        it('should throw an error if config.serverURL is not valid', function () {
            expect(function () {
                checkConfig({ serverURL: 1234 });
            }).toThrowError('`serverURL` property must be a string.');
        });
    });

    // Reset global state to prevent errors in different tests
    afterAll(() => {
        cleanDefaultConfig(undefined);
    });
});
