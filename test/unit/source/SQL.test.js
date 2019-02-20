import SQL from '../../../src/sources/SQL';
import { CartoValidationTypes as cvt } from '../../../src/errors/carto-validation-error';

describe('sources/SQL', () => {
    const query = 'SELECT * from table0';
    const auth = {
        username: 'test',
        apiKey: '1234567890'
    };
    const options = {
        serverURL: 'https://{user}.test.com'
    };

    describe('constructor', () => {
        it('should build a new Source with (query, auth, options)', () => {
            const source = new SQL(query, auth, options);
            expect(source._query).toEqual('SELECT * from table0');
            expect(source._username).toEqual('test');
            expect(source._apiKey).toEqual('1234567890');
            expect(source._serverURL).toEqual('https://test.test.com');
            expect(source._client).toBeDefined();
        });

        it('should build a new Source with (query, auth) and default options', () => {
            const source = new SQL(query, auth);
            expect(source._query).toEqual('SELECT * from table0');
            expect(source._username).toEqual('test');
            expect(source._apiKey).toEqual('1234567890');
            expect(source._serverURL).toEqual('https://test.carto.com');
            expect(source._client).toBeDefined();
        });

        it('should throw an error if query is not valid', function () {
            expect(function () {
                new SQL();
            }).toThrowError(cvt.MISSING_REQUIRED + ' \'query\'');

            expect(function () {
                new SQL(1234);
            }).toThrowError(cvt.INCORRECT_TYPE + ' \'query\' property must be a string.');

            expect(function () {
                new SQL('');
            }).toThrowError(cvt.INCORRECT_VALUE + ' \'query\' property must be not empty.');

            expect(function () {
                new SQL('ABC');
            }).toThrowError(cvt.INCORRECT_VALUE + ' \'query\' property must be a SQL query.');
        });

        it('should build a new Source with query having the_geom_webmercator', () => {
            const source = new SQL(`
                SELECT
                1 as cartodb_id,
                ST_Transform(ST_SetSRID(ST_MakePoint(1, 0), 4326), 3857) as the_geom_webmercator
            `, auth);
            expect(source._username).toEqual('test');
            expect(source._apiKey).toEqual('1234567890');
            expect(source._serverURL).toEqual('https://test.carto.com');
            expect(source._client).toBeDefined();
        });
    });
});
