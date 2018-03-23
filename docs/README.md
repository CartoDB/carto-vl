# CARTO GL

CARTO GL is a javascript library to render map data in the browser using the [webgl](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) capabilities.


## Getting started

TBD

## Drawing a simple map using MapboxGL

```html
<!DOCTYPE html>
<html>
<head>
  <title>Single layer | CARTO</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta charset="UTF-8">
  <!-- Include CARTO GL JS -->
  <script src="../../dist/carto-gl.js"></script>
  <!-- Include CARTO Mapbox GL JS fork -->
  <script src="../../vendor/mapbox-gl-dev.js"></script>
  <!-- Include Mapbox GL CSS -->
  <link href="../../vendor/mapbox-gl-dev.css" rel="stylesheet" />
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
      apiKey: 'YOUR_API_KEY'
    });

    // Set the source of your data
    const source = new carto.source.Dataset('ne_10m_populated_places_simple');
    // Set the look and feel of your data
    const style = new carto.Style();
    // Create a new layer
    const layer = new carto.Layer('layer', source, style);
    // Add the new layer to the map
    layer.addTo(map, 'watername_ocean');
  </script>
</body>
</html>

```
