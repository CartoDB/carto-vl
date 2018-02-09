const serve = require('serve');
const path = require('path');
serve(path.join(__dirname, '../../'), {
    port: 5555,
});
