import Histogram from './Histogram';
import Property from '../basic/property';
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

        if (!this.property.isA(Property)) {
            this._setHistogramForExpression();
            return;
        }

        if (this.property.type === 'number') {
            this._setHistogramForNumericValues();
            return;
        }

        this._setHistogramForCategoryValues();
    }

    _setHistogramForExpression () {
        const name = this.propertyName;
        const categories = this._metadata.properties[name]
            ? this._metadata.properties[name].categories
            : [];

        const data = this.property._getLegendData().data;

        categories.forEach(c => {
            const category = data.find(category => c.name === category.key);
            if (category) {
                this._histogram.set(c.name, c.frequency);
            } else {
                const frequency = this._histogram.get('CARTO_VL_OTHERS') || 0;
                this._histogram.set('CARTO_VL_OTHERS', c.frequency + parseInt(frequency));
            }
        });
    }

    _setHistogramForCategoryValues () {
        const name = this.propertyName;
        const categories = this._metadata.properties[name]
            ? this._metadata.properties[name].categories
            : [];

        categories.forEach(category => {
            this._histogram.set(category.name, category.frequency);
        });
    }

    _setHistogramForNumericValues () {
        const name = this.propertyName;
        const histogram = this._metadata.sample
            .map((feature) => {
                return {
                    key: feature.id,
                    value: feature[name]
                };
            });

        histogram.forEach(feature => {
            this._histogram.set(feature.value, feature.key);
        });
    }
}
