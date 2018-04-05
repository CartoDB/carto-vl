import Expression from './expression';
import * as schema from '../../schema';
import Property from './property';
import { checkInstance, checkType } from './utils';

// Aggregation ops
export const Max = genAggregationOp('max', 'float');
export const Min = genAggregationOp('min', 'float');
export const Avg = genAggregationOp('avg', 'float');
export const Sum = genAggregationOp('sum', 'float');
export const Mode = genAggregationOp('mode', 'category');

function genAggregationOp(aggFunction, aggType) {
    return class AggregationOperation extends Expression {
        constructor(property) {
            checkInstance(aggFunction, 'property', 0, Property, property);
            super({ property });
            this._type = aggType;
            this._function = aggFunction;
        }
        get name() {
            return this.property.name;
        }
        get numCategories() {
            return this.property.numCategories;
        }
        get type() {
            return this._type;
        }
        get function() {
            return this._function;
        }
        eval(feature) {
            return feature[schema.column.aggregatedName(aggFunction, this.property.name)];
        }
        //Override super methods, we don't want to let the property use the raw column, we must use the agg suffixed one
        _compile(metadata) {
            super._compile(metadata);
            checkType(aggFunction, 'property', 0, aggType, this.property);
        }
        _applyToShaderSource(uniformIDMaker, getGLSLforProperty) {
            return {
                preface: '',
                inline: `${getGLSLforProperty(schema.column.aggregatedName(aggFunction, this.property.name))}`
            };
        }
        _postShaderCompile() { }
        _getMinimumNeededSchema() {
            return {
                columns: [
                    schema.column.aggregatedName(aggFunction, this.property.name)
                ]
            };
        }
    };
}
