<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script>
      // This script hides the map attribution when served locally improving screenshot testing precision.
      if (document.URL.includes('file')) {
        const styleElement = document.createElement('style');
        styleElement.innerText = '.mapboxgl-ctrl.mapboxgl-ctrl-attrib {  display: none; }';
        document.head.appendChild(styleElement);
      }
    </script>
    <script src="<%- cartovl %>"></script>
    <!-- Include Mapbox GL JS -->
    <script src="https://unpkg.com/@carto/mapbox-gl@0.44.1-carto1/dist/mapbox-gl.js"></script>
    <!-- Include Mapbox GL CSS -->
    <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.44.1/mapbox-gl.css" rel="stylesheet" />
    <style>
      body { margin: 0; padding: 0; }
      #map { position: absolute; height: 100%; width: 100%; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const sources = <%= sources %>;
    </script>
    <script src="<%- file %>"></script>
  </body>
</html>
