import Expression from './expression';
import { float } from '../functions';

export const ViewportMax = generateViewportExpression('max');
export const ViewportMin = generateViewportExpression('min');
export const ViewportAvg = generateViewportExpression('avg');
export const ViewportSum = generateViewportExpression('sum');
export const ViewportCount = generateViewportExpression('count');

export const GlobalMax = generateViewportExpression('max', true);
export const GlobalMin = generateViewportExpression('min', true);
export const GlobalAvg = generateViewportExpression('avg', true);
export const GlobalSum = generateViewportExpression('sum', true);
export const GlobalCount = generateViewportExpression('count', true);

function generateViewportExpression(metadataPropertyName, global) {
    return class ViewportAggregattion extends Expression {
        /**
         * @jsapi
         * @param {*} property
         */
        constructor(property) {
            super({ value: float(0) });
            this.property = property;
        }
        _compile(metadata) {
            console.log(metadata);
            super._compile(metadata);
            this.property._compile(metadata);
            this.type = 'float';
            super.inlineMaker = inline => inline.value;
            if (global){
                this.value.expr = metadata.columns.find(c => c.name == this.property.name)[metadataPropertyName];
            }
        }
        _getMinimumNeededSchema() {
            return this.property._getMinimumNeededSchema();
        }
        _getDrawMetadataRequirements() {
            return { columns: [this.property.name] };
        }
        _preDraw(drawMetadata, gl) {
            const column = drawMetadata.columns.find(c => c.name == this.property.name);
            if (!global) {
                this.value.expr = column[metadataPropertyName];
            }
            if (Math.random() > 0.999) {
                console.log(metadataPropertyName, this.property.name, this.value.expr);
            }
            this.value._preDraw(drawMetadata, gl);
        }
        getValue() {
            return this.value.expr;
        }
    };
}


export class ViewportPercentile extends Expression {
    /**
     * @jsapi
     * @param {*} property
     */
    constructor(property, percentile) {
        if (!Number.isFinite(percentile)) {
            throw new Error('Percentile must be a fixed literal number');
        }
        super({ value: float(0) });
        this.property = property;
        this.percentile = percentile;
    }
    _compile(metadata) {
        super._compile(metadata);
        this.property._compile(metadata);
        this.type = 'float';
        super.inlineMaker = inline => inline.value;
    }
    _getMinimumNeededSchema() {
        return this.property._getMinimumNeededSchema();
    }
    _getDrawMetadataRequirements() {
        return { columns: [this.property.name] };
    }
    _preDraw(drawMetadata, gl) {
        const column = drawMetadata.columns.find(c => c.name == this.property.name);
        const total = column.accumHistogram[999];
        // TODO OPT: this could be faster with binary search
        for (var i = 0; i < column.histogramBuckets; i++) {
            if (column.accumHistogram[i] >= this.percentile / 100 * total) {
                break;
            }
        }
        const br = i / column.histogramBuckets * (column.max - column.min) + column.min;
        this.value.expr = br;

        if (Math.random() > 0.99) {
            console.log(`percentile${this.percentile}`, this.property.name, br, drawMetadata);
        }
        this.value._preDraw(drawMetadata, gl);
    }
    getValue() {
        return this.value.expr;
    }
}
