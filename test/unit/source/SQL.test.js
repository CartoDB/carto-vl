import SQL from '../../../src/sources/SQL';

describe('sources/SQL', () => {
    const query = 'SELECT * from table0';
    const auth = {
        user: 'test',
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
            }).toThrowError('`query` property is required.');
            expect(function () {
                new SQL(1234);
            }).toThrowError('`query` property must be a string.');
            expect(function () {
                new SQL('');
            }).toThrowError('`query` property must be not empty.');
            expect(function () {
                new SQL('ABC');
            }).toThrowError('`query` property must be a SQL query.');
        });
    });
});
