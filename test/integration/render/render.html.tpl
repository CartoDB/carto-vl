<!DOCTYPE html>
<html>

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="<%- cartovl %>"></script>
  <script src="<%- mapboxgl %>"></script>
  <script src="<%- glmatrix %>"></script>
  <script src="/test/CartoMap.js"></script>
  <link href="<%- mapboxglcss %>" rel="stylesheet" />
  <style>
    body {
      margin: 0;
      padding: 0;
    }

    #map {
      position: absolute;
      height: 100%;
      width: 100%;
    }

    .mapboxgl-ctrl.mapboxgl-ctrl-attrib {
      display: none;
    }
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
