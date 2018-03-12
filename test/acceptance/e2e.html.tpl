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
        <script src="<%- cartogl %>"></script>
        <script src="<%- mapboxgl %>"></script>
        <link href="<%- mapboxglcss %>" rel="stylesheet" />
        <style>
            body { margin: 0; padding: 0; }
            #map { position: absolute; height: 100%; width: 100%; }
        </style>
    </head>
    <body>
        <div id='map'></div>
        <script src="<%- file %>"></script>
        <script>
            layer.on('loaded', () => window.loaded = true); // Used by screenshot testing utility
        </script>
    </body>
</html>
