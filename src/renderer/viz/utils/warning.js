export function showDeprecationWarning (args, ExpressionClass, deprecatedExpressionName, newExpressionName) {
    console.warn(`DeprecationWarning: "${deprecatedExpressionName}" expression is deprecated. Please use "${newExpressionName}" instead.`);
    return new ExpressionClass(...args);
}
