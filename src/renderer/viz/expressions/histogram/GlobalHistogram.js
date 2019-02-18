import Histogram from './Histogram';
import { checkMaxArguments, implicitCast } from '../utils';

export default class GlobalHistogram extends Histogram {
    constructor (property, sizeOrBuckets = 20) {
        checkMaxArguments(arguments, 3, 'globalHistogram');
        super({ property: implicitCast(property) });

        this._sizeOrBuckets = sizeOrBuckets;
        this._hasBuckets = Array.isArray(sizeOrBuckets);
        this._histogram = new Map();
    }

    eval () {
        return this.property.type === 'number'
            ? (this._hasBuckets ? this._getBucketsValue(this._histogram, this._sizeOrBuckets) : this._getNumericValue(this._histogram, this._sizeOrBuckets))
            : this._getCategoryValue(this._histogram);
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);

        const categories = this._metadata.properties[this.property.name]
            ? this._metadata.properties[this.property.name].categories
            : [];

        if (categories && categories.length) {
            categories.forEach(category => {
                this._histogram.set(category.name, category.frequency);
            });
        } else {
            const name = this.property.name;
            const histogram = metadata.sample
                .map((feature) => {
                    return {
                        key: feature.id,
                        value: feature[name]
                    };
                })
                .sort((x, y) => x - y);

            histogram.forEach(feature => {
                this._histogram.set(feature.value, feature.key);
            });
        }
    }
}
