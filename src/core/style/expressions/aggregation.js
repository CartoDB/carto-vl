import Expression from './expression';

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
                inline: `p${propertyTIDMaker(`_cdb_agg_${aggName}_${this.property.name}`)}`
            };
        }
        eval(feature) {
            return feature[`_cdb_agg_${aggName}_${this.property.name}`];
        }
        _postShaderCompile() { }
        _getMinimumNeededSchema() {
            return {
                columns: [
                    `_cdb_agg_${aggName}_${this.property.name}`
                ]
            };
        }
    };
} 
