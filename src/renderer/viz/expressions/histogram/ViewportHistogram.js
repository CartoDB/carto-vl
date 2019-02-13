import Histogram from './Histogram';
import { checkMaxArguments, implicitCast } from '../utils';

export default class ViewportHistogram extends Histogram {
    constructor (property, sizeOrBuckets = 20, weight = 1) {
        checkMaxArguments(arguments, 3, 'viewportHistogram');
        super({ property: implicitCast(property), weight: implicitCast(weight) });

        this._sizeOrBuckets = sizeOrBuckets;
        this._isViewport = true;
        this._hasBuckets = Array.isArray(sizeOrBuckets);
    }

    accumViewportAgg (feature) {
        this._addHistogramData(feature);
    }

    _resetViewportAgg (metadata) {
        if (metadata) {
            this._bindMetadata(metadata);
        }
        this._cached = null;
        this._histogram = new Map();
    }
}
