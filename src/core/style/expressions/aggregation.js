import Expression from './expression';
import * as schema from '../../schema';

// Aggregation ops
export const Max = genAggregationOp('max');
export const Min = genAggregationOp('min');
export const Avg = genAggregationOp('avg');
export const Sum = genAggregationOp('sum');
export const Mode = genAggregationOp('mode');

function genAggregationOp(aggName) {
    return class AggregationOperation extends Expression {
        constructor(property) {
            super({ property: property });
        }
        get name() {
            return this.property.name;
        }
        get numCategories() {
            return this.property.numCategories;
        }
        //Override super methods, we don't want to let the property use the raw column, we must use the agg suffixed one
        _compile(metadata) {
            super._compile(metadata);
            this.type = this.property.type;
        }
        _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
            return {
                preface: '',
                inline: `p${propertyTIDMaker(schema.column.aggColumn(this.property.name, aggName))}`
            };
        }
        eval(feature) {
            return feature[schema.column.aggColumn(this.property.name, aggName)];
        }
        _postShaderCompile() { }
        _getMinimumNeededSchema() {
            return {
                columns: [
                    schema.column.aggColumn(this.property.name, aggName)
                ]
            };
        }
    };
}
