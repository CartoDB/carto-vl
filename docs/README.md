# CARTO VL

CARTO VL is a javascript library to render map data in the browser using [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) capabilities.


## Getting started

https://github.com/CartoDB/carto-vl-webpack-demo

## Drawing a simple map using MapboxGL

```html
<!DOCTYPE html>
<html>
<head>
  <title>Single layer | CARTO</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta charset="UTF-8">
  <!-- Include CARTO VL JS -->
  <script src="../../dist/carto-vl.js"></script>
  <!-- Include CARTO Mapbox GL JS fork -->
  <script src="https://cartodb-libs.global.ssl.fastly.net/mapbox-gl/v0.45.0-carto1/mapbox-gl.js"></script>
  <!-- Include Mapbox GL CSS -->
  <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.45.0/mapbox-gl.css" rel="stylesheet" />
  <style>
    body { margin: 0; padding: 0; }
    #map { position: absolute; height: 100%; width: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // Create a mapbox basemap
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [2.17, 41.38],
      zoom: 0
    });

    // Login into your CARTO account
    carto.setDefaultAuth({
      user: 'cartogl',
      apiKey: 'YOUR_API_KEY_HERE'
    });

    // Set the source of your data
    const source = new carto.source.Dataset('ne_10m_populated_places_simple');
    // Set the look and feel of your data
    const viz = new carto.Viz();
    // Create a new layer
    const layer = new carto.Layer('layer', source, viz);
    // Add the new layer to the map
    layer.addTo(map, 'watername_ocean');
  </script>
</body>
</html>

```
