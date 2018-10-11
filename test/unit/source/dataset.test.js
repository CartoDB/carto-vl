import Dataset from '../../../src/sources/Dataset';
import { CartoValidationTypes as cvt } from '../../../src/errors/carto-validation-error';
import { regExpThatContains as thatContains } from '../../../src/utils/util';

describe('sources/dataset', () => {
    const tableName = 'table0';
    const auth = {
        username: 'test',
        apiKey: '1234567890'
    };
    const options = {
        serverURL: 'https://{user}.test.com'
    };

    describe('constructor', () => {
        it('should build a new Source with (tableName, auth, options)', () => {
            const source = new Dataset(tableName, auth, options);
            expect(source._tableName).toEqual('table0');
            expect(source._username).toEqual('test');
            expect(source._apiKey).toEqual('1234567890');
            expect(source._serverURL).toEqual('https://test.test.com');
            expect(source._client).toBeDefined();
        });

        it('should build a new Source with (tableName, auth) and default options', () => {
            const source = new Dataset(tableName, auth);
            expect(source._tableName).toEqual('table0');
            expect(source._username).toEqual('test');
            expect(source._apiKey).toEqual('1234567890');
            expect(source._serverURL).toEqual('https://test.carto.com');
            expect(source._client).toBeDefined();
        });

        it('should throw an error if tableName is not valid', function () {
            expect(function () {
                new Dataset();
            }).toThrowError(thatContains(cvt.MISSING_REQUIRED + ' \'tableName\''));

            expect(function () {
                new Dataset(1234);
            }).toThrowError(thatContains(cvt.INCORRECT_TYPE + ' \'tableName\''));

            expect(function () {
                new Dataset('');
            }).toThrowError(thatContains(cvt.INCORRECT_VALUE + ' \'tableName\''));
        });
    });
});
