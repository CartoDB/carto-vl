import Histogram from './Histogram';
import { checkMaxArguments, implicitCast } from '../utils';

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

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);

        if (this.property.type === 'number') {
            const name = this.property.name;
            const histogram = metadata.sample
                .map((feature) => {
                    return {
                        key: feature.cartodb_id,
                        value: feature[name]
                    };
                })
                .sort((x, y) => x - y);

            histogram.forEach(feature => {
                this._histogram.set(feature.value, feature.key);
            });
        } else {
            const categories = this._metadata.properties[this.property.name].categories;
            categories.forEach(category => {
                this._histogram.set(category.name, category.frequency);
            });
        }
    }
}
