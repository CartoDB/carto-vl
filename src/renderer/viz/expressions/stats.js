
export const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

export const standardDeviation = (values) => {
    const avg = average(values);
    const squareDifferences = values.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = average(squareDifferences);
    return Math.sqrt(avgSquareDiff);
};
