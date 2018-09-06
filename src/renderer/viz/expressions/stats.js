
/**
 * Calculate Average
 *
 * @param {Number[]} values
 * @returns {Number} - average
 */
export const average = (values) => {
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
        sum += values[i];
    }
    return sum / values.length;
};
/**
 * Calculate Variance
 *
 * @param {Number[]} values
 * @param {Number} average
 * @returns {Number[]} - calculate variance for each element in values
 */
export const variance = (values, average) => {
    let variances = [];
    for (let i = 0; i < values.length; i++) {
        const diff = values[i] - average;
        variances.push(diff * diff);
    }
    return variances;
};

/**
 * Calculate Standard Deviation (STD), using population deviation formula
 *
 * @param {Number[]} values
 * @returns {Number} - standard deviation
 */
export const standardDeviation = (values) => {
    const avg = average(values);
    const avgVariance = average(variance(values, avg));
    return Math.sqrt(avgVariance);
};
