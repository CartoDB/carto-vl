import Histogram from './Histogram';
import { checkMaxArguments, implicitCast } from '../utils';
import { CLUSTER_FEATURE_COUNT } from '../../../schema';
export default class ViewportHistogram extends Histogram {
    constructor (property, sizeOrBuckets = 20, weight = 1) {
        checkMaxArguments(arguments, 3, 'viewportHistogram');
        super({ property: implicitCast(property), weight: implicitCast(weight) });

        this._sizeOrBuckets = sizeOrBuckets;
        this._isViewport = true;
        this._hasBuckets = Array.isArray(sizeOrBuckets);
    }

    accumViewportAgg (feature) {
        const property = this.property.eval(feature);

        if (property !== undefined) {
            const clusterCount = feature[CLUSTER_FEATURE_COUNT] || 1;
            const weight = clusterCount * this.weight.eval(feature);
            const count = this._histogram.get(property) || 0;
            this._histogram.set(property, count + weight);
        }
    }

    _resetViewportAgg (metadata) {
        if (metadata) {
            this._bindMetadata(metadata);
        }
        this._cached = null;
        this._histogram = new Map();
    }
}
