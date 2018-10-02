## Interactivity and Events
In this guide you will learn how to XXX. After practicing with it, you will be able to XXXX.

### Using variables

### Feature Events

### Map Events

### Adding pop ups

### Interactive based styling

---

### All together

Congrats! You have finished this guide. The final map should look like this:
<div class="example-map">
    <iframe
        id="guides-sources-source-sql"
        src="https://carto.com/developers/carto-vl/examples/maps/guides/interactivity/XXXXX.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>


This is the complete code:
```html
<!DOCTYPE html>
<html>

<head>
    <!-- Include CARTO VL JS -->
    <script src="../../../../dist/carto-vl.js"></script>
    <!-- Include Mapbox GL JS -->
    <script src="https://libs.cartocdn.com/mapbox-gl/v0.48.0-carto1/mapbox-gl.js"></script>
    <!-- Include Mapbox GL CSS -->
    <link href="https://libs.cartocdn.com/mapbox-gl/v0.48.0-carto1/mapbox-gl.css" rel="stylesheet" />
    <!-- Make the map visible -->
    <style>
        #map {
            position: absolute;
            height: 100%;
            width: 100%;
        }
    </style>
</head>

<body>
    <!-- Add map container -->
    <div id="map"></div>

    <script>
        // Add basemap and set properties
        const map = new mapboxgl.Map({
            container: 'map',
            style: carto.basemaps.voyager,
            center: [0, 30],
            zoom: 2,
            scrollZoom: false,
            dragRotate: false,
            touchZoomRotate: false,
        });
        // Add zoom controls
        const nav = new mapboxgl.NavigationControl({
            showCompass: false
        });
        map.addControl(nav, 'top-left');


        //** CARTO VL functionality begins here **//


    </script>
</body>

</html>
```
