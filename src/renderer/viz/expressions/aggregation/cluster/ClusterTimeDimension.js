import BaseExpression from '../../base';
import PropertyExpression from '../../basic/property';
import { checkType, checkInstance, checkExpression } from '../../utils';
import * as schema from '../../../../schema';

const SERIAL_UNITS = [
    'second', 'minute', 'hour',
    'day', 'month', 'year',
    'week', 'quarter', 'trimester', 'semester',
    'decade', 'century', 'millennium'
];

const CYCLIC_UNITS = [
    'dayOfYear', 'weekOfYear', 'monthOfYear', 'quarterOfYear',
    'dayOfMonth', 'dayOfWeek',
    'hourOfDay', 'minuteOfHour'
];

// TODO: generalize with base clusterDimension
export default class clusterTimeDimension extends BaseExpression {
    constructor ({ property, expressionName, dimension, type, range }) {
        checkExpression(expressionName, 'property', 0, property);
        super({ property });
        this._dimension = dimension;
        this._dimension.propertyName = schema.column.dimColumn(this.property.name, this._dimension.group.units);
        this._expressionName = expressionName;
        this.type = type;
        this._range = range;
    }

    static get serialUnits () {
        return SERIAL_UNITS;
    }

    static get cyclicUnits () {
        return CYCLIC_UNITS;
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
        const inline = this._range
            ? this._range.map(propertyName => [
                `${getGLSLforProperty(propertyName)}`
            ])
            : `${getGLSLforProperty(this.propertyName)}`;

        return {
            preface: '',
            inline
        };
    }

    _postShaderCompile () {}

    _getMinimumNeededSchema () {
        return {
            [this.property.name]: [{
                type: 'dimension',
                dimension: this._dimension,
                range: !!this._range
            }]
        };
    }
}
