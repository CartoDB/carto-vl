
import BaseExpression from '../../base';
import PropertyExpression from '../../basic/property';
import { checkType, checkInstance, checkExpression, checkMaxArguments, checkStringValue } from '../../utils';
import * as schema from '../../../../schema';

// experimental clusterTimeRange which returns a TimeRange
// expressions returning TimeRange must provide three inlined expressions
// in eval to a TimeRange

const SERIAL_UNITS = [
    'second', 'minute', 'hour',
    'day', 'month', 'year',
    'week', 'quarter', 'trimester', 'semester',
    'decade', 'century', 'millennium'
];

export default class clusterTimeRange extends BaseExpression {
    constructor (property, units, timezone) {
        const expressionName = 'clusterTimeRange';
        checkMaxArguments(arguments, 3, expressionName);
        super({ property });
        checkExpression(expressionName, 'property', 0, property);
        const validUnits = SERIAL_UNITS;
        checkStringValue(expressionName, 'units', 1, units, validUnits);
        this._dimension = {
            group: {
                units: units,
                timezone
            },
            format: 'iso'
        };
        this._dimension.propertyName = schema.column.dimColumn(this.property.name, units);
        this.type = 'timerange';
        this._expressionName = expressionName;
        this._range = [];
    }

    get name () {
        return this.property.name;
    }

    get propertyName () {
        return this._dimension.propertyName;
    }

    eval (feature) {
        return feature[this.propertyName];
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkInstance(this._expressionName, 'property', 0, PropertyExpression, this.property);
        checkType(this._expressionName, 'property', 0, 'date', this.property);
        this._range = metadata.properties[metadata.baseName(this.propertyName)].dimension.range;
    }

    _resolveAliases () {}

    _applyToShaderSource (getGLSLforProperty) {
        return {
            preface: '',
            inline: this._range.map(propertyName => [
                `${getGLSLforProperty(propertyName)}`
            ])
        };
    }

    _postShaderCompile () {}

    _getMinimumNeededSchema () {
        return {
            [this.property.name]: {
                type: 'dimension',
                dimension: this._dimension,
                range: true
            }
        };
    }
}
