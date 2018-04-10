import Expression from './expression';
import { float } from '../functions';
import * as schema from '../../schema';

export const ViewportMax = generateAggregattion('max');
export const ViewportMin = generateAggregattion('min');
export const ViewportAvg = generateAggregattion('avg');
export const ViewportSum = generateAggregattion('sum');
export const ViewportCount = generateAggregattion('count');

export const GlobalMax = generateAggregattion('max', true);
export const GlobalMin = generateAggregattion('min', true);
export const GlobalAvg = generateAggregattion('avg', true);
export const GlobalSum = generateAggregattion('sum', true);
export const GlobalCount = generateAggregattion('count', true);

export const ViewportPercentile = generatePercentile();
export const GlobalPercentile = generatePercentile(true);

function generateAggregattion(metadataPropertyName, global) {
    return class Aggregattion extends Expression {
        /**
         * @jsapi
         * @param {*} property
         */
        constructor(property) {
            super({ value: float(0) });
            this.property = property;
        }
        eval() {
            return this.value.expr;
        }
        _compile(metadata) {
            super._compile(metadata);
            // TODO improve type check
            this.property._compile(metadata);
            this.type = 'float';
            super.inlineMaker = inline => inline.value;
            if (global) {
                this.value.expr = metadata.columns.find(c => c.name === this.property.name)[metadataPropertyName];
            }
        }
        _getMinimumNeededSchema() {
            return this.property._getMinimumNeededSchema();
        }
        _getDrawMetadataRequirements() {
            if (!global) {
                return { columns: [this._getColumnName()] };
            } else {
                return { columns: [] };
            }
        }
        _preDraw(drawMetadata, gl) {
            const name = this._getColumnName();
            const column = drawMetadata.columns.find(c => c.name === name);
            if (!global) {
                this.value.expr = column[metadataPropertyName];
            }
            if (Math.random() > 0.999) {
                console.log(metadataPropertyName, name, this.value.expr);
            }
            this.value._preDraw(drawMetadata, gl);
        }
        _getColumnName() {
            if (this.property.aggName) {
                // Property has aggregation
                return schema.column.aggColumn(this.property.name, this.property.aggName);
            }
            return this.property.name;
        }
    };
}

function generatePercentile(global) {
    return class Percentile extends Expression {
        /**
         * @jsapi
         * @param {*} property
         */
        constructor(property, percentile) {
            if (!Number.isFinite(percentile)) {
                throw new Error('Percentile must be a fixed literal number');
            }
            super({ value: float(0) });
            // TODO improve type check
            this.property = property;
            this.percentile = percentile;
        }
        _compile(metadata) {
            super._compile(metadata);
            this.property._compile(metadata);
            this.type = 'float';
            super.inlineMaker = inline => inline.value;
            if (global) {
                const copy = metadata.sample.map(s => s[this.property.name]);
                copy.sort((x, y) => x - y);
                const p = this.percentile / 100;
                this.value.expr = copy[Math.floor(p * copy.length)];
            }
        }
        _getMinimumNeededSchema() {
            return this.property._getMinimumNeededSchema();
        }
        _getDrawMetadataRequirements() {
            if (!global) {
                return { columns: [this._getColumnName()] };
            } else {
                return { columns: [] };
            }
        }
        _preDraw(drawMetadata, gl) {
            const name = this._getColumnName();
            if (!global) {
                const column = drawMetadata.columns.find(c => c.name === name);
                const total = column.accumHistogram[column.histogramBuckets - 1];
                // TODO OPT: this could be faster with binary search
                for (var i = 0; i < column.histogramBuckets; i++) {
                    if (column.accumHistogram[i] >= this.percentile / 100 * total) {
                        break;
                    }
                }
                const br = i / column.histogramBuckets * (column.max - column.min) + column.min;
                this.value.expr = br;
            }
            if (Math.random() > 0.99) {
                console.log(`percentile${this.percentile}`, name, this.value.expr);
            }
            this.value._preDraw(drawMetadata, gl);
        }
        eval() {
            return this.value.expr;
        }
        _getColumnName() {
            if (this.property.aggName) {
                // Property has aggregation
                return schema.column.aggColumn(this.property.name, this.property.aggName);
            }
            return this.property.name;
        }
    };
}
