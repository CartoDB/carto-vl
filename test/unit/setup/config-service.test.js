import { setDefaultConfig, getDefaultConfig, checkConfig, cleanDefaultConfig } from '../../../src/setup/config-service';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../src/errors/carto-validation-error';
import { regExpThatContains as thatContains } from '../../../src/utils/util';

describe('api/setup/config-service', () => {
    const config = {
        serverURL: 'https://{user}.test.com'
    };

    describe('.getDefaultConfig and .setDefaultConfig', () => {
        it('should return undefined on init', () => {
            expect(getDefaultConfig()).toBeUndefined();
        });

        let defaultConfig;
        beforeEach(() => {
            defaultConfig = getDefaultConfig();
        });
        it('should return the last config set', () => {
            setDefaultConfig(config);
            expect(getDefaultConfig()).toEqual(config);
        });
        afterEach(() => {
            setDefaultConfig(defaultConfig);
        });
    });

    describe('.checkConfig', () => {
        it('should throw an error if config is not valid', function () {
            expect(function () {
                checkConfig(1234);
            }).toThrowError(CartoValidationError, thatContains(cvt.INCORRECT_TYPE + ' \'config\''));
        });

        it('should throw an error if config.serverURL is not valid', function () {
            expect(function () {
                checkConfig({ serverURL: 1234 });
            }).toThrowError(CartoValidationError, thatContains(cvt.INCORRECT_TYPE + ' \'serverURL\''));
        });
    });

    // Reset global state to prevent errors in different tests
    afterAll(() => {
        cleanDefaultConfig(undefined);
    });
});
