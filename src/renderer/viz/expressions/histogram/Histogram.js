import BaseExpression from '../base';
import Top from '../top';
import Property from '../basic/property';
import BaseCategory from '../basic/category';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../../errors/carto-validation-error';

const VALID_INPUTS = [ Top, Property, BaseCategory ];

export default class Histogram extends BaseExpression {
    constructor (children) {
        if (!_validInput(children.input)) {
            const validInputNames = VALID_INPUTS.map(input => input.name).join(', ');
            throw new CartoValidationError(`${cvt.INCORRECT_VALUE} Input '${children.input.expressionName}' is not valid for a histogram expression. Accepted inputs are: ${validInputNames}.`);
        }
        super(children);
        this.type = 'histogram';
        this.inlineMaker = () => null;
    }

    eval () {
        return this.input.type === 'number'
            ? (this._hasBuckets ? this._getBucketsValue(this._histogram, this._sizeOrBuckets) : this._getNumericValue(this._histogram, this._sizeOrBuckets))
            : this._getCategoryValue(this._histogram);
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        this._metadata = metadata;
        const name = this._propertyName;
        this._categories = this._metadata.properties[name]
            ? this._metadata.properties[name].categories.sort(this._sortNumerically)
            : [];
    }

    _getCategoryValue (histogram) {
        return [...histogram]
            .map(([x, y]) => {
                return { x, y };
            })
            .sort(this._sortNumerically)
            .map((category, index) => {
                const x = typeof category.x === 'number' ? this._categories[index].name : category.x;
                const y = category.y;

                return { x, y };
            });
    }

    _sortNumerically (a, b) {
        const frequencyDifference = (b.y - a.y);

        if (frequencyDifference === 0) {
            const categoryA = a.x;
            const categoryB = b.x;

            if (!categoryA && !categoryB) { return 0; } // both null or undefined
            if (!categoryA) { return 1; } // categoryB first
            if (!categoryB) { return -1; } // categoryA first

            return categoryA.localeCompare(categoryB);
        }

        return frequencyDifference;
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
}

function _validInput (input) {
    return VALID_INPUTS.some(expression => input.isA(expression));
}
