// Unique entry point for all tests, this allows running webpack only once improving performance.
// WARNING: Since all tests are bundled in the same file be carefull with polluting the global scope!
let testsContext = require.context('.', true, /test.js$/);
testsContext.keys().forEach(testsContext);
