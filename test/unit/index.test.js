// Unique entry point for all unit tests, this allows running webpack only once improving performance.
var testsContext = require.context('.', true, /test.js$/);
testsContext.keys().forEach(testsContext);
