const path = require('path');

module.exports =
  {
    devtool: 'source-map',
    entry: {
      mapbox: "./example/mapbox.js",
    },
    output: {
      path: path.join(__dirname, "dist"),
      filename: "[name].js"
    }
  };
