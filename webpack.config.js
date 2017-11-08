const path = require('path');

module.exports =
  {
    entry: {
      standalone: "./example/standalone.js",
      mapbox: "./example/mapbox.js",
      gmaps: "./example/gmaps.js",
    },
    output: {
      path: path.join(__dirname, "dist"),
      filename: "[name].js"
    }
  };
