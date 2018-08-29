
/*
    Adapted from `simple-statistics` - Copyright (c) 2014, Tom MacWright (ISC License)
    https://github.com/simple-statistics/
*/
function _jenksMatrices (data, numClasses) {
    let lowerClassLimits = []; // (LC): optimal lower class limits
    let varianceCombinations = []; //  (OP): optimal variance combinations for all classes

    let i;
    let j;
    let variance = 0;

    // Initialize and fill each matrix with zeroes
    for (i = 0; i < data.length + 1; i++) {
        let tmp1 = [];
        let tmp2 = [];
        for (j = 0; j < numClasses + 1; j++) {
            tmp1.push(0);
            tmp2.push(0);
        }
        lowerClassLimits.push(tmp1);
        varianceCombinations.push(tmp2);
    }

    for (i = 1; i < numClasses + 1; i++) {
        lowerClassLimits[1][i] = 1;
        varianceCombinations[1][i] = 0;
        for (j = 2; j < data.length + 1; j++) {
            varianceCombinations[j][i] = Infinity;
        }
    }

    for (let l = 2; l < data.length + 1; l++) {
        let sum = 0; // `SZ`  sum of the values seen thus far when calculating variance.
        let sumSquares = 0; // `ZSQ` the sum of squares of values seen thus far
        let w = 0; // `WT`
        let i4 = 0; // `IV`

        for (let m = 1; m < l + 1; m++) {
            let lowerClassLimit = l - m + 1; // `III`
            let val = data[lowerClassLimit - 1];

            w++; // `w` is the number of data points considered so far.

            // increase the current sum and sum-of-squares
            sum += val;
            sumSquares += val * val;
            variance = sumSquares - (sum * sum) / w;

            i4 = lowerClassLimit - 1;

            if (i4 !== 0) {
                for (j = 2; j < numClasses + 1; j++) {
                    // if adding this element to an existing class
                    // will increase its variance beyond the limit, break
                    // the class at this point, setting the `lowerClassLimit`
                    // at this point.
                    if (varianceCombinations[l][j] >=
                        (variance + varianceCombinations[i4][j - 1])) {
                        lowerClassLimits[l][j] = lowerClassLimit;
                        varianceCombinations[l][j] = variance +
                            varianceCombinations[i4][j - 1];
                    }
                }
            }
        }

        lowerClassLimits[l][1] = 1;
        varianceCombinations[l][1] = variance;
    }

    return {
        lowerClassLimits: lowerClassLimits,
        varianceCombinations: varianceCombinations // useful to evaluate goodness of fit
    };
}

function _jenksBreaks (data, lowerClassLimits, numClasses) {
    let k = data.length;
    let kclass = [];
    let countNum = numClasses;

    // the calculation of classes will never include the upper
    // bound, so we need to explicitly set it
    kclass[numClasses] = data[data.length - 1];

    // the lowerClassLimits matrix is used as indices into itself
    // here: the `k` variable is reused in each iteration.
    while (countNum > 0) {
        kclass[countNum - 1] = data[lowerClassLimits[k][countNum] - 1];
        k = lowerClassLimits[k][countNum] - 1;
        countNum--;
    }
    return kclass;
}

function _sortDataNumerical (data) {
    return data.slice().sort(function (a, b) { return a - b; });
}

/**
 * [Jenks natural breaks optimization](http://en.wikipedia.org/wiki/Jenks_natural_breaks_optimization)
 *
 * @export
 * @param {Number[]} data - numerical array
 * @param {Number} numClasses - number of classes
 * @returns {Number[]} - array with n breaks
 */
export default function jenks (data, numClasses) {
    if (numClasses > data.length) return null;

    const sortedData = _sortDataNumerical(data);
    let matrices = _jenksMatrices(sortedData, numClasses);

    return _jenksBreaks(sortedData, matrices.lowerClassLimits, numClasses);
}
