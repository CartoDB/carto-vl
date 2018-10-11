
import BaseExpression from '../../base';
import PropertyExpression from '../../basic/property';
import { checkType, checkInstance, checkExpression, checkMaxArguments, checkStringValue } from '../../utils';
import { timeRange } from '../../../../../utils/util';
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
        const expressionName = expressionName;
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
        },
        this._dimension.propertyName = schema.column.dimColumn(this.property.name, units);
        this.type = 'timerange'
        this._expressionName = expressionName;
    }

    get name () {
        return this.property.name;
    }

    propertyNameFor (mode = null) {
        let name = this._dimension.propertyName;
        if (mode) {
            name = name + '_' + mode;
        }
        return name;
    }

    get propertyName () {
        return this.propertyNameFor(null);
    }

    eval (feature) {
        return timeRange(feature[this.propertyName]);
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkInstance(this._expressionName, 'property', 0, PropertyExpression, this.property);
        checkType(this._expressionName, 'property', 0, 'date', this.property);
    }

    _resolveAliases () {}

    _applyToShaderSource (getGLSLforProperty) {
        return {
            preface: '',
            inline: {
                start: `${getGLSLforProperty(this.propertyNameFor('start'))}`,
                end: `${getGLSLforProperty(this.propertyNameFor('end'))}`,
                text: `${getGLSLforProperty(this.propertyName)}`
            }
        };
    }

    _postShaderCompile () {}

    _getMinimumNeededSchema () {
        return {
            [this.property.name]: ['start', 'end', null].map(mode => {
                return {
                    type: 'dimension',
                    dimension: this._dimension,
                    mode
                };
            })
        };
    }
}
