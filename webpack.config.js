const path = require('path');

module.exports =
  {
    entry: {
      standalone: "./example/standalone.js",
      mapbox: "./example/mapbox.js",
    },
    output: {
      path: path.join(__dirname, "dist"),
      filename: "[name].js"
    }
  };
