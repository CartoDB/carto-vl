
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

// experimental: this flag enables/disables of support for the category form of the time range
// in the GPU. (so that for example buckets, ramps could be made aware of it).
// but it requires three dataframe properties instead of two.
const CATEGORY_SUPPORT = false;

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
        // return this.propertyNameFor('start');
        return this.propertyNameFor(null);
    }

    eval (feature) {
        return feature[this.propertyName];
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
                text: CATEGORY_SUPPORT ? `${getGLSLforProperty(this.propertyNameFor(null))}` : undefined,
                start: `${getGLSLforProperty(this.propertyNameFor('start'))}`,
                end: `${getGLSLforProperty(this.propertyNameFor('end'))}`
            }
        };
    }

    _postShaderCompile () {}

    _getMinimumNeededSchema () {
        const modes = ['start', 'end'];
        if (CATEGORY_SUPPORT) {
            modes.push(null);
        }
        return {
            [this.property.name]: modes.map(mode => {
                return {
                    type: 'dimension',
                    dimension: this._dimension,
                    mode
                };
            })
        };
    }
}
