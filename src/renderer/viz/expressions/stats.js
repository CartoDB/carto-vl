
/**
 * Calculate Average
 *
 * @param {Number[]} values
 * @returns {Number} - average
 */
export const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

/**
 * Calculate Variance
 *
 * @param {Number[]} values
 * @param {Number} average
 * @returns {Number[]} - calculate variance for each element in values
 */
export const variance = (values, average) => values.map(value => Math.pow(value - average, 2));

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
