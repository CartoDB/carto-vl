const path = require('path');

module.exports = {
  entry: './example/index.js',
  output: {
    library: "main",
    libraryTarget: "umd",
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
