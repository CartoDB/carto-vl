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

    eval () {
        if (this._cached === null) {
            if (!this._histogram) {
                return null;
            }

            this._cached = this.property.type === 'number'
                ? (this._hasBuckets ? this._getBucketsValue(this._histogram, this._sizeOrBuckets) : this._getNumericValue(this._histogram, this._sizeOrBuckets))
                : this._getCategoryValue(this._histogram);

            return this._cached;
        }

        return this._cached;
    }

    _resetViewportAgg (metadata) {
        if (metadata) {
            this._bindMetadata(metadata);
        }
        this._cached = null;
        this._histogram = new Map();
    }
}
