import BaseExpression from '../base';
export default class Histogram extends BaseExpression {
    constructor (children) {
        super(children);
        this.type = 'histogram';
        this.inlineMaker = () => null;
    }

    get value () {
        switch (this.input.type) {
            case 'number':
                return this._hasBuckets
                    ? this._getBucketsValue(this._histogram, this._sizeOrBuckets)
                    : this._getNumericValue(this._histogram, this._sizeOrBuckets);
            case 'date':
                return this._hasBuckets
                    ? this._getBucketsValue(this._histogram, this._sizeOrBuckets)
                    : this._getDateValue(this._histogram, this._sizeOrBuckets);
            default:
                return this._getCategoryValue(this._histogram);
        }
    }

    eval () {
        return this.value;
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        this._metadata = metadata;
        const name = this.propertyName;
        this._categories = this._metadata.properties[name]
            ? this._metadata.properties[name].categories.sort(this._sortByFrequency)
            : [];
    }

    _getCategoryValue (histogram) {
        return [...histogram]
            .map(([x, y]) => {
                return { x, y };
            })
            .sort(this._sortByFrequency)
            .map((category, index) => {
                const x = typeof category.x === 'number' && this._categories[index]
                    ? this._categories[index].name
                    : category.x;
                const y = category.y;

                return { x, y };
            });
    }

    _getNumericValue (histogram, size) {
        const array = [...histogram];
        const arrayLength = array.length;
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;

        for (let i = 0; i < arrayLength; i++) {
            const x = array[i][0];
            min = Math.min(min, x);
            max = Math.max(max, x);
        }

        const hist = Array(size).fill(0);
        const range = max - min;
        const sizeMinusOne = size - 1;

        for (let i = 0; i < arrayLength; i++) {
            const x = array[i][0];
            const y = array[i][1];
            const index = Math.min(Math.floor(size * (x - min) / range), sizeMinusOne);
            hist[index] += y;
        }

        return hist.map((count, index) => {
            return {
                x: [min + index / size * range, min + (index + 1) / size * range],
                y: count
            };
        });
    }

    _getBucketsValue ([...histogram], buckets) {
        buckets = buckets.length && buckets.length === 0 ? this._genBreakpoints(buckets) : buckets;
        const nBuckets = buckets.length;
        const hist = Array(nBuckets).fill(0);

        for (let i = 0, len = histogram.length; i < len; i++) {
            const x = histogram[i][0];
            for (let j = 0; j < nBuckets; j++) {
                const bucket = buckets[j];
                if (x >= bucket[0] && x < bucket[1]) {
                    hist[j] += histogram[i][1];
                    break;
                }
            }
        }

        return hist.map((count, index) => {
            return {
                x: buckets[index],
                y: count
            };
        });
    }

    _getDateValue (histogram, size) {
        const array = [...histogram].map((value) => {
            return { x: value[0].getTime(), y: value[1] };
        });
        const arrayLength = array.length;

        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;

        for (let i = 0; i < arrayLength; i++) {
            const x = array[i].x;
            min = Math.min(min, x);
            max = Math.max(max, x);
        }

        const hist = Array(size).fill(0);
        const range = max - min;
        const sizeMinusOne = size - 1;

        for (let i = 0; i < arrayLength; i++) {
            const x = array[i].x;
            const y = array[i].y;
            const index = Math.min(Math.floor(size * (x - min) / range), sizeMinusOne);
            hist[index] += y;
        }

        return hist.map((count, index) => {
            const x0 = new Date(min + index / size * range);
            const x1 = new Date(min + (index + 1) / size * range);

            return {
                x: [x0, x1],
                y: count
            };
        });
    }

    _genBreakpoints () {
        const histogram = this._histogram.value;

        if (!histogram) {
            return;
        }

        const accumHistogram = this._getAccumHistogramFrom(histogram);
        const [min, max] = this._getMinMaxFrom(histogram);

        this._updateBreakpointsWith({ accumHistogram, min, max });
    }

    _getAccumHistogramFrom (histogram) {
        let prev = 0;
        const accumHistogram = histogram.map(({ y }) => {
            prev += y;
            return prev;
        });
        return accumHistogram;
    }

    _getMinMaxFrom (histogram) {
        const min = histogram[0].x[0];
        const max = histogram[histogram.length - 1].x[1];

        return [min, max];
    }

    _sortByFrequency (a, b) {
        const frequencyDifference = (b.y - a.y);

        if (frequencyDifference === 0) {
            const categoryA = a.x;
            const categoryB = b.x;

            if (!categoryA && !categoryB) { return 0; } // both null or undefined
            if (!categoryA) { return 1; } // categoryB first
            if (!categoryB) { return -1; } // categoryA first

            if (typeof categoryA === 'string' && typeof categoryB === 'string') {
                return categoryA.localeCompare(categoryB);
            }

            if (categoryA < categoryB) return -1; // categoryA first
            if (categoryA > categoryB) return 1; // categoryB first
            return 0;
        }

        return frequencyDifference;
    }
}
