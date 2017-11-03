const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    library: "renderer", // 
    libraryTarget: "umd",
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
