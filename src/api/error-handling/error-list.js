const validation = {
    layer: {
        'id-required': {
            messageRegex: /idRequired/,
            friendlyMessage: '`id` property required.'
        },
        'id-string-required': {
            messageRegex: /idStringRequired/,
            friendlyMessage: '`id` property must be a string.'
        },
        'non-valid-id': {
            messageRegex: /nonValidId/,
            friendlyMessage: '`id` property must be not empty.'
        },
        'source-required': {
            messageRegex: /sourceRequired/,
            friendlyMessage: '`source` property required.'
        },
        'non-valid-source': {
            messageRegex: /nonValidSource/,
            friendlyMessage: 'The given object is not a valid source. See "carto.source.Base".'
        },
        'style-required': {
            messageRegex: /styleRequired/,
            friendlyMessage: '`style` property required.'
        },
        'non-valid-style': {
            messageRegex: /nonValidStyle/,
            friendlyMessage: 'The given object is not a valid style. See "carto.Style".'
        }
    },
    setup: {
        'auth-required': {
            messageRegex: /authRequired/,
            friendlyMessage: '`auth` property is required.'
        },
        'auth-object-required': {
            messageRegex: /authObjectRequired/,
            friendlyMessage: '`auth` property must be an object.'
        },
        'api-key-required': {
            messageRegex: /apiKeyRequired/,
            friendlyMessage: '`apiKey` property is required.'
        },
        'api-key-string-required': {
            messageRegex: /apiKeyStringRequired/,
            friendlyMessage: '`apiKey` property must be a string.'
        },
        'non-valid-api-key': {
            messageRegex: /nonValidApiKey/,
            friendlyMessage: '`apiKey` property must be not empty.'
        },
        'username-required': {
            messageRegex: /usernameRequired/,
            friendlyMessage: '`username` property is required.'
        },
        'username-string-required': {
            messageRegex: /usernameStringRequired/,
            friendlyMessage: '`username` property must be a string.'
        },
        'non-valid-username': {
            messageRegex: /nonValidUsername/,
            friendlyMessage: '`username` property must be not empty.'
        },
        'config-object-required': {
            messageRegex: /configObjectRequired/,
            friendlyMessage: '`config` property must be an object.'
        },
        'server-url-string-required': {
            messageRegex: /serverURLStringRequired/,
            friendlyMessage: '`serverURL` property must be a string.'
        }
    },
    source: {
        'non-valid-server-url': {
            messageRegex: /nonValidServerURL/,
            friendlyMessage: '`serverURL` property is not a valid URL.'
        },
        'table-name-required': {
            messageRegex: /tableNameRequired/,
            friendlyMessage: '`tableName` property is required.'
        },
        'table-name-string-required': {
            messageRegex: /tableNameStringRequired$/,
            friendlyMessage: '`tableName` property must be a string.'
        },
        'non-valid-table-name': {
            messageRegex: /nonValidTableName$/,
            friendlyMessage: '`tableName` property must be not empty.'
        },
        'query-required': {
            messageRegex: /queryRequired/,
            friendlyMessage: '`query` property is required.'
        },
        'query-string-required': {
            messageRegex: /queryStringRequired$/,
            friendlyMessage: '`query` property must be a string.'
        },
        'non-valid-query': {
            messageRegex: /nonValidQuery$/,
            friendlyMessage: '`query` property must be not empty.'
        },
        'non-valid-sql-query': {
            messageRegex: /nonValidSQLQuery$/,
            friendlyMessage: '`query` property must be a SQL query.'
        },
        'data-required': {
            messageRegex: /dataRequired/,
            friendlyMessage: '`data` property is required.'
        },
        'data-object-required': {
            messageRegex: /dataObjectRequired$/,
            friendlyMessage: '`data` property must be an object.'
        },
        'non-valid-geojson-data': {
            messageRegex: /nonValidGeoJSONData$/,
            friendlyMessage: '`data` property must be a GeoJSON object.'
        },
        'multiple-feature-types': {
            messageRegex: /multipleFeatureTypes\[(.+)\]$/,
            friendlyMessage: 'multiple types not supported: $0.'
        },
        'first-polygon-external': {
            messageRegex: /firstPolygonExternal$/,
            friendlyMessage: 'first polygon ring must be external.'
        }
    },
    style: {
        'non-valid-definition': {
            messageRegex: /nonValidDefinition$/,
            friendlyMessage: 'style definition should be a styleSpec object or a valid style string.'
        },
        'non-valid-expression': {
            messageRegex: /nonValidExpression\[(.+)\]$/,
            friendlyMessage: '`$0` parameter is not a valid style Expresion.'
        },
        'resolution-number-required': {
            messageRegex: /resolutionNumberRequired$/,
            friendlyMessage: '`resolution` must be a number.'
        }
    }
};

export { validation };
