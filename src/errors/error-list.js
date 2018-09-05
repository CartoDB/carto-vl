const validation = {
    expressions: {
        'aggreg-percentile-must-be-number': {
            messageRegex: /aggregPercentileMustBeNumber$/,
            friendlyMessage: 'Percentile must be a fixed literal number'
        },
        'aggrUndefined-metadata-for-property': {
            messageRegex: /aggrUndefinedMetadataForProperty\[(.+), (.+)\]$/,
            friendlyMessage: 'Metadata $0 for property $1 is not defined'
        },
        'array-no-elements': {
            messageRegex: /arrayNoElements$/,
            friendlyMessage: 'array(): invalid parameters: must receive at least one argument'
        },
        'array-invalid-param-type': {
            messageRegex: /arrayInvalidParamType\[(.+)\]$/,
            friendlyMessage: 'array(): invalid parameters type: $0'
        },
        'array-invalid-param-type-combination': {
            messageRegex: /arrayInvalidParamTypeCombination\[(.+)\]$/,
            friendlyMessage: 'array(): invalid $0 parameter type, invalid argument type combination'
        },
        'binary-wrong-signature': {
            messageRegex: /binaryWrongSignature\[(.+), (.+), (.+)\]$/,
            friendlyMessage: '$0(): invalid parameter types\n\'x\' type was $1, \'y\' type was $2'
        },
        'blend-wrong-signature': {
            messageRegex: /blendWrongSignature\[(.+), (.+)\]$/,
            friendlyMessage: 'blend(): invalid parameter types\n\'a\' type was \'$0\', \'b\' type was \'$1\''
        },
        'buckets-invalid-input-type': {
            messageRegex: /bucketsInvalidInputType\[(.+)\]$/,
            friendlyMessage: 'buckets(): invalid first parameter type\n\t\'input\' type was $0'
        },
        'buckets-invalid-param-type': {
            messageRegex: /bucketsInvalidParamType\[(.+), (.+)\]$/,
            friendlyMessage: 'buckets(): invalid $0 parameter type\n\ttype was $1'
        },
        'buckets-invalid-param-type-with-expected': {
            messageRegex: /bucketsInvalidParamTypeWithExpected\[(.+), (.+), (.+)\]$/,
            friendlyMessage: 'buckets(): invalid $0 parameter type\n\texpected type was $1\n\tactual type was $2'
        },
        'expression-extra-parameters': {
            messageRegex: /expressionExtraParameters$/,
            friendlyMessage: 'Extra parameters'
        },
        'expression-invalid-array': {
            messageRegex: /expressionInvalidArray\[(.+), (.+)\]$/,
            friendlyMessage: '$0\n\'$1\' is not an array'
        },
        'expression-invalid-hex': {
            messageRegex: /expressionInvalidHex$/,
            friendlyMessage: 'Invalid hexadecimal color'
        },
        'expression-invalid-instance': {
            messageRegex: /expressionInvalidInstance\[(.+), (.+)\]$/,
            friendlyMessage: '$0\nexpected type was instance of \'$1\''
        },
        'expression-invalid-number': {
            messageRegex: /expressionInvalidNumber\[(.+), (.+), (.+)\]$/,
            friendlyMessage: '$0\ntype of \'$1\' is $2, \'number\' was expected'
        },
        'expression-invalid-string': {
            messageRegex: /expressionInvalidString\[(.+), (.+)\]$/,
            friendlyMessage: '$0\ntype \'$1\' is not a string'
        },
        'expression-invalid-type': {
            messageRegex: /expressionInvalidType\[(.+), (.+), (.+)\]$/,
            friendlyMessage: '$0\nexpected type was \'$1\', actual type was \'$2\''
        },
        'expression-max-args-exceeded': {
            messageRegex: /expressionMaxArgsExceeded\[(.+), (.+), (.+)\]$/,
            friendlyMessage: 'Expression $0 accepts $1 arguments, but $2 were passed.'
        },
        'expression-non-feature-independent': {
            messageRegex: /expressionNonFeatureIndependent\[(.+)\]$/,
            friendlyMessage: '$0\nparameter cannot be feature dependent'
        },
        'expression-param-is-not-exp': {
            messageRegex: /expressionParamIsNotExp\[(.+), (.+)\]$/,
            friendlyMessage: '$0\n\'$1\' is not of type carto.expressions.Base'
        },
        'expression-unimplemented-eval': {
            messageRegex: /expressionUnimplementedEval$/,
            friendlyMessage: 'Unimplemented eval'
        },
        'hex-invalid-color-string': {
            messageRegex: /hexInvalidColorString\[(.+)\]$/,
            friendlyMessage: '$0\nInvalid hexadecimal color string'
        },
        'hsl-wrong-param-type': {
            messageRegex: /hslWrongParamType\[(.+), (.+), (.+)\]$/,
            friendlyMessage: '$0(): invalid parameter\n\t$1 type was: \'$2\''
        },
        'hsv-wrong-param-type': {
            messageRegex: /hsvWrongParamType\[(.+), (.+), (.+)\]$/,
            friendlyMessage: '$0(): invalid parameter\n\t$1 type was: \'$2\''
        },
        'interpolator-blending-not-allowed': {
            messageRegex: /interpolatorBlendingNotAllowed\[(.+)\]$/,
            friendlyMessage: 'Blending cannot be performed by \'$0\''
        },
        'named-color-invalid-name': {
            messageRegex: /namedColorInvalidName\[(.+), (.+)\]$/,
            friendlyMessage: '$0\nInvalid color name: \'$1\''
        },
        'property-empty-name': {
            messageRegex: /propertyEmptyName$/,
            friendlyMessage: 'property(): invalid parameter, zero-length string'
        },
        'property-no-feature': {
            messageRegex: /propertyNoFeature$/,
            friendlyMessage: 'A property needs to be evaluated in a feature'
        },
        'property-not-exists': {
            messageRegex: /propertyNotExists\[(.+)\]$/,
            friendlyMessage: 'Property \'$0\' does not exist'
        },
        'ramp-palettes-error': {
            messageRegex: /rampPalettesError$/,
            friendlyMessage: 'Palettes must be formed by constant expressions, they cannot depend on feature properties'
        },
        'ramp-unexpected-error-eval-number-array': {
            messageRegex: /rampUnexpectedErrorEvalNumberArray$/,
            friendlyMessage: 'Unexpected condition on ramp._evalNumberArray()'
        },
        'transition-negative-duration': {
            messageRegex: /transitionNegativeDuration\[(.+)\]$/,
            friendlyMessage: '$0 duration must be greater than or equal to 0'
        },
        'top-max-buckets-exceeded': {
            messageRegex: /topMaxBucketsExceeded\[(.+), (.+)\]$/,
            friendlyMessage: 'top() function has a limit of $0 buckets but \'$1\' buckets were specified'
        },
        'unary-unavailable-for-type': {
            messageRegex: /unaryUnavailableForType\[(.+)\]$/,
            friendlyMessage: 'Unary operation cannot be performed to \'$0\''
        },
        'variable-empty-name': {
            messageRegex: /variableEmptyName$/,
            friendlyMessage: 'variable(): invalid parameter, zero-length string'
        },
        'variable-not-exists': {
            messageRegex: /variableNotExists\[(.+)\]$/,
            friendlyMessage: 'Variable name \'$0\' does not exist'
        },
        'viewport-features-arg-no-prop': {
            messageRegex: /viewportFeaturesArgNoProp$/,
            friendlyMessage: 'viewportFeatures arguments can only be properties'
        },
        'viewport-features-no-viz': {
            messageRegex: /viewportFeaturesNoViz$/,
            friendlyMessage: 'viewportFeatures cannot be used in visualizations'
        },
        'zoomrange-less-than-two': {
            messageRegex: /zoomrangeLessThanTwo$/,
            friendlyMessage: 'zoomrange() function must receive a list with at least two elements'

        }
    },
    interactivity: {
        'empty-layer-list': {
            messageRegex: /emptyLayerList$/,
            friendlyMessage: 'Invalid argument, layer list must not be empty'
        },
        'invalid-layer': {
            messageRegex: /invalidLayer$/,
            friendlyMessage: 'Invalid layer, layer must be an instance of carto.Layer'
        },
        'invalid-layer-list': {
            messageRegex: /invalidLayerList$/,
            friendlyMessage: 'Invalid layer list, parameter must be an array of carto.Layer objects'
        },
        'not-same-map': {
            messageRegex: /notSameMap$/,
            friendlyMessage: 'Invalid argument, all layers must belong to the same map'
        },
        'unrecognized-event': {
            messageRegex: /unrecognizedEvent\[(.+), (.+)\]$/,
            friendlyMessage: 'Unrecognized event: $0. Available events: $1'
        }
    },
    layer: {
        'atomic-change': {
            messageRegex: /atomicChange$/,
            friendlyMessage: 'Another atomic change was done before this one committed'
        },
        'unsupported-event': {
            messageRegex: /unsupportedEvent\[(.+)\]$/,
            friendlyMessage: 'Event name \'$0\' is not supported by \'carto.on\'. Supported event names are: \'loaded\', \'updated\'.'
        },
        'id-required': {
            messageRegex: /idRequired$/,
            friendlyMessage: '`id` property required.'
        },
        'id-string-required': {
            messageRegex: /idStringRequired$/,
            friendlyMessage: '`id` property must be a string.'
        },
        'non-valid-id': {
            messageRegex: /nonValidId$/,
            friendlyMessage: '`id` property must be not empty.'
        },
        'not-same-dataframe-type': {
            messageRegex: /notSameDataframeType$/,
            friendlyMessage: 'Layer dataframes must always be of the same type'
        },
        'source-change-stale-metadata': {
            messageRegex: /sourceChangeStaleMetadata$/,
            friendlyMessage: 'A source change was made before the metadata was retrieved, therefore, metadata is stale and it cannot be longer consumed'
        },
        'source-required': {
            messageRegex: /sourceRequired$/,
            friendlyMessage: '`source` property required.'
        },
        'source-required-to-change-viz': {
            messageRegex: /sourceRequiredToChangeViz$/,
            friendlyMessage: 'A source is required before changing the viz'
        },
        'non-valid-source': {
            messageRegex: /nonValidSource$/,
            friendlyMessage: 'The given object is not a valid source. See "carto.source.Base".'
        },
        'viz-required': {
            messageRegex: /vizRequired$/,
            friendlyMessage: '`viz` property required.'
        },
        'non-valid-viz': {
            messageRegex: /nonValidViz$/,
            friendlyMessage: 'The given object is not a valid viz. See "carto.Viz".'
        },
        'shared-viz': {
            messageRegex: /sharedViz$/,
            friendlyMessage: 'The given Viz object is already bound to another layer. Vizs cannot be shared between different layers'
        }
    },
    map: {
        'container-not-found': {
            messageRegex: /containerNotFound\[(.+)\]$/,
            friendlyMessage: 'Container \'$0\' not found.'
        }
    },
    mvt: {
        'decoding-property-error': {
            messageRegex: /decodingPropertyError\[(.+)\]$/,
            friendlyMessage: 'MVT decoding error. Feature property value of type \'$0\' cannot be decoded.'
        },
        'decoding-property-error-type': {
            messageRegex: /decodingPropertyErrorType\[(.+), (.+), (.+), (.+)\]$/,
            friendlyMessage: 'MVT decoding error. Metadata property \'$0\' is of type \'$1\' but the MVT tile contained a feature property of type $2: \'$3\''
        },
        'invalid-geometry-type': {
            messageRegex: /invalidGeometryType$/,
            friendlyMessage: 'MVT: invalid geometry type'
        },
        'mixed-geometry-types': {
            messageRegex: /mixedGeometryTypes\[(.+), (.+)\]$/,
            friendlyMessage: 'MVT: mixed geometry types in the same layer. Layer has type: $0 but feature was $1'
        },
        'no-layer-id-having-multiple': {
            messageRegex: /noLayerIdHavingMultiple\[(.+)\]$/,
            friendlyMessage: 'LayerID parameter wasn\'t specified and the MVT tile contains multiple layers: $0'
        },
        'undefined-id-property': {
            messageRegex: /undefinedIdProperty\[(.+)\]$/,
            friendlyMessage: 'MVT feature with undefined idProperty \'$0\''
        }
    },
    parser: {
        'already-defined': {
            messageRegex: /alreadyDefined\[(.+)\]$/,
            friendlyMessage: '$0 \'$1\' is already defined.'
        },
        'invalid-expression': {
            messageRegex: /invalidExpression\[(.+)\]$/,
            friendlyMessage: 'Invalid expression \'$0\'.'
        },
        'invalid-function-name': {
            messageRegex: /invalidFunctionName\[(.+)\]$/,
            friendlyMessage: 'Invalid function name \'$0\'.'
        },
        'invalid-operator': {
            messageRegex: /invalidOperator\[(.+), (.+)\]$/,
            friendlyMessage: 'Invalid $0 operator \'$1\'.'
        },
        'invalid-syntax': {
            messageRegex: /invalidSyntax$/,
            friendlyMessage: 'Invalid syntax.'
        }
    },
    renderer: {
        'error-compiling-shaders': {
            messageRegex: /errorCompilingShaders\[(.+), (.+)\]$/,
            friendlyMessage: 'An error occurred compiling the shaders: $0\nSource:\n$1'
        },
        'max-render-buffer-size-below': {
            messageRegex: /maxRenderBufferSizeBelow\[(.+), (.+)\]$/,
            friendlyMessage: 'WebGL parameter \'gl.MAX_RENDERBUFFER_SIZE\' is below the requirement: $0 < $1'
        },
        'unimplemented-geometry-type': {
            messageRegex: /unimplementedGeometryType\[(.+)\]$/,
            friendlyMessage: 'Unimplemented geometry type \'$0\''
        },
        'unable-to-link-shader': {
            messageRegex: /unableToLinkShader\[(.+)\]$/,
            friendlyMessage: 'Unable to link the shader program: $0'
        },
        'unsupported-webgl-1': {
            messageRegex: /unsupportedWebGL1$/,
            friendlyMessage: 'WebGL 1 is unsupported'
        },
        'unsupported-oes-texture-float': {
            messageRegex: /unsupportedOESTextureFloat$/,
            friendlyMessage: 'WebGL extension OES_texture_float is unsupported'
        }
    },
    setup: {
        'auth-required': {
            messageRegex: /authRequired$/,
            friendlyMessage: '`auth` property is required.'
        },
        'auth-object-required': {
            messageRegex: /authObjectRequired$/,
            friendlyMessage: '`auth` property must be an object.'
        },
        'api-key-required': {
            messageRegex: /apiKeyRequired$/,
            friendlyMessage: '`apiKey` property is required.'
        },
        'api-key-string-required': {
            messageRegex: /apiKeyStringRequired$/,
            friendlyMessage: '`apiKey` property must be a string.'
        },
        'non-valid-api-key': {
            messageRegex: /nonValidApiKey$/,
            friendlyMessage: '`apiKey` property must be not empty.'
        },
        'username-required': {
            messageRegex: /usernameRequired$/,
            friendlyMessage: '`username` property is required.'
        },
        'username-string-required': {
            messageRegex: /usernameStringRequired$/,
            friendlyMessage: '`username` property must be a string.'
        },
        'non-valid-username': {
            messageRegex: /nonValidUsername$/,
            friendlyMessage: '`username` property must be not empty.'
        },
        'config-object-required': {
            messageRegex: /configObjectRequired$/,
            friendlyMessage: '`config` property must be an object.'
        },
        'server-url-string-required': {
            messageRegex: /serverURLStringRequired$/,
            friendlyMessage: '`serverURL` property must be a string.'
        }
    },
    source: {
        'geojson-prop-mixed-type': {
            messageRegex: /geojsonPropMixedType\[(.+)\]$/,
            friendlyMessage: 'Unsupported GeoJSON: the property \'$0\' has different types in different features.'
        },
        'non-valid-server-url': {
            messageRegex: /nonValidServerURL$/,
            friendlyMessage: '`serverURL` property is not a valid URL.'
        },
        'non-valid-template-url': {
            messageRegex: /nonValidTemplateURL$/,
            friendlyMessage: '`templateURL` property is not a valid URL.'
        },
        'metadata-required': {
            messageRegex: /metadataRequired$/,
            friendlyMessage: '`metadata` property is required for MVT source.'
        },
        'table-name-required': {
            messageRegex: /tableNameRequired$/,
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
            messageRegex: /queryRequired$/,
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
            messageRegex: /dataRequired$/,
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
        },
        'feature-has-cartodb_id': {
            messageRegex: /featureHasCartodbId$/,
            friendlyMessage: '`cartodb_id` is a reserved property so it can not be used'
        }
    },
    viz: {
        'circular-dependency': {
            messageRegex: /circularDependency$/,
            friendlyMessage: 'Viz contains a circular dependency'
        },
        'no-child-found': {
            messageRegex: /noChildFound$/,
            friendlyMessage: 'No child found'
        },
        'non-valid-definition': {
            messageRegex: /nonValidDefinition$/,
            friendlyMessage: 'viz definition should be a vizSpec object or a valid viz string.'
        },
        'non-valid-expression': {
            messageRegex: /nonValidExpression\[(.+)\]$/,
            friendlyMessage: '`$0` parameter is not a valid viz Expresion.'
        },
        'property-must-be-of-type': {
            messageRegex: /propertyMustBeOfType\[(.+), (.+), (.+)\]$/,
            friendlyMessage: 'Viz property \'$0:\' must be of type \'$1\' but it was of type $2'
        },
        'resolution-number-required': {
            messageRegex: /resolutionNumberRequired$/,
            friendlyMessage: '`resolution` must be a number.'
        },
        'resolution-too-small': {
            messageRegex: /resolutionTooSmall\[(.+)\]$/,
            friendlyMessage: '`resolution` must be greater than $0.'
        },
        'resolution-too-big': {
            messageRegex: /resolutionTooBig\[(.+)\]$/,
            friendlyMessage: '`resolution` must be less than $0.'
        }
    },
    windshaft: {
        'aggr-not-supported': {
            messageRegex: /aggrNotSupported$/,
            friendlyMessage: 'Aggregation not supported for this dataset'
        },
        'decoding-error': {
            messageRegex: /decodingError\[(.+)\]$/,
            friendlyMessage: 'Windshaft MVT decoding error. Feature property value of type \'$0\' cannot be decoded.'
        },
        'failed-maps-connection': {
            messageRegex: /failedMapsConnection\[(.+)\]$/,
            friendlyMessage: 'Failed to connect to Maps API with your user(\'$0\')'
        },
        'incompatible-cluster-aggr': {
            messageRegex: /incompatibleClusterAggr\[(.+), (.+)\]$/,
            friendlyMessage: `Incompatible combination of cluster aggregation usages (
                $0
            }) with unaggregated usage for property '$1'`
        },
        'sql-errors': {
            messageRegex: /sqlErrors\[(.+)\]$/,
            friendlyMessage: 'SQL errors: $0'
        },
        'unimplemented-geometry-type': {
            messageRegex: /unimplementedGeometryType\[(.+)\]$/,
            friendlyMessage: 'Unimplemented geometry type \'$0\''
        }
    }
};

const security = {
    windshaft: {
        'unauthorized-access-to-maps': {
            messageRegex: /unauthorizedAccessToMaps\[(.+), (.+)\]$/,
            friendlyMessage: 'Unauthorized access to Maps API: invalid combination of user(\'$0\') and apiKey(\'$1\')'
        },
        'unauthorized-access-to-dataset': {
            messageRegex: /unauthorizedAccessToDataset\[(.+)\]$/,
            friendlyMessage: 'Unauthorized access to dataset: the provided apiKey(\'$0\') doesn\'t provide access to the requested data'
        }
    }
};

export { validation, security };
