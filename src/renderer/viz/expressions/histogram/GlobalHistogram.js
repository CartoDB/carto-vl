import Histogram from './Histogram';
import { checkMaxArguments, implicitCast } from '../utils';
import { CLUSTER_FEATURE_COUNT } from '../../../schema';
export default class GlobalHistogram extends Histogram {
    constructor (property, sizeOrBuckets = 20, weight = 1) {
        checkMaxArguments(arguments, 3, 'globalHistogram');
        super({ property: implicitCast(property), weight: implicitCast(weight) });

        this._sizeOrBuckets = sizeOrBuckets;
        this._isGlobal = true;
        this._hasBuckets = Array.isArray(sizeOrBuckets);
        this._histogram = new Map();
    }

    eval () {
        if (this._cached) {
            return this._cached;
        }

        this._cached = this.property.type === 'number'
            ? (this._hasBuckets ? this._getBucketsValue(this._histogram, this._sizeOrBuckets) : this._getNumericValue(this._histogram, this._sizeOrBuckets))
            : this._getCategoryValue(this._histogram);

        return this._cached;
    }

    accumGlobalAgg (feature) {
        const property = this.property.eval(feature);

        if (property !== undefined) {
            const clusterCount = feature[CLUSTER_FEATURE_COUNT] || 1;
            const weight = clusterCount * this.weight.eval(feature);
            this._histogram.set(property, weight);
        }
    }

    _resetGlobalAgg (metadata) {
        if (metadata) {
            this._bindMetadata(metadata);
        }

        this._cached = null;
    }
}
