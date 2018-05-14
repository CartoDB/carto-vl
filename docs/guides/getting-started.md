# Getting started

## Displaying the basemap

<details>
<summary>Full example</summary>

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Include CARTO VL JS -->
  <script src="https://cartodb-libs.global.ssl.fastly.net/carto-vl/v0.3.0/carto-vl.js"></script>
  <!-- Include Mapbox GL JS -->
  <script src="https://cartodb-libs.global.ssl.fastly.net/mapbox-gl/v0.44.1-carto1/mapbox-gl.js"></script>
  <!-- Include Mapbox GL CSS -->
  <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.44.1/mapbox-gl.css" rel="stylesheet" />
  <!-- Make the map visible -->
  <style>
    #map {
      height: 100%;
      width: 100%;
    }
  </style>
</head>
<body>
  <!-- Map goes here -->
  <div id="map"></div>
  <script>
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [0, 30],
      zoom: 2,
      dragRotate: false
    });
  </script>
</body>
</html>
```

</details>

CARTO VL is a JavaScript library that interacts with different CARTO APIs to build custom apps leveraging vector rendering. 

The easiest way to use CARTO VL is to include the required files from our CDN. This will add the `carto` and the `mapboxgl` objects to the global namespace.

```html
<head>
  <!-- Include CARTO VL JS -->
  <script src="https://cartodb-libs.global.ssl.fastly.net/carto-vl/v0.3.0/carto-vl.js"></script>
  <!-- Include Mapbox GL JS -->
  <script src="https://cartodb-libs.global.ssl.fastly.net/mapbox-gl/v0.44.1-carto1/mapbox-gl.js"></script>
  <!-- Include Mapbox GL CSS -->
  <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.44.1/mapbox-gl.css" rel="stylesheet" />
</head>
```

You will need to create a `div` where the map is going to be drawn, in this case we give the div the `map` id.

```html
  <div id="map"></div>
```

Remember to style this div to ensure it will be displayed

```css
#map {
    height: 100%;
    width: 100%;
}
```


Once we have the div, we use the `mapboxgl` object to initialize our map:

```js
const map = new mapboxgl.Map({
      center: [0, 30],
      container: 'map',
      dragRotate: false
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      zoom: 2,
    });
```

The `container` is the id of the div where the map is going to be placed. The `center` and the `zoom` indicates the area of the world
we are going to visualize. `dragRotate` disables the map rotation (not supported by CARTO VL) and the `style` contains the information about
how the basemap is going to be rendered. You can add [mapbox custom styles](https://www.mapbox.com/mapbox-gl-js/style-spec/) or choose one predefined style offered by CARTO:

- [Voyager](https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json)
- [Positron](https://basemaps.cartocdn.com/gl/positron-gl-style/style.json)
- [DarkMatter](https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json)


Once we get to this point we should see a basic map.


## Adding data from CARTO


<details>
<summary>Full example</summary>

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Include CARTO VL JS -->
  <script src="https://cartodb-libs.global.ssl.fastly.net/carto-vl/v0.3.0/carto-vl.js"></script>
  <!-- Include Mapbox GL JS -->
  <script src="https://cartodb-libs.global.ssl.fastly.net/mapbox-gl/v0.44.1-carto1/mapbox-gl.js"></script>
  <!-- Include Mapbox GL CSS -->
  <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.44.1/mapbox-gl.css" rel="stylesheet" />
  <!-- Make the map visible -->
  <style>
    #map {
      height: 100%;
      width: 100%;
    }
  </style>
</head>
<body>
  <!-- Map goes here -->
  <div id="map"></div>
  <script>
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [0, 30],
      zoom: 2,
      dragRotate: false
    });
    // Autenticate the client
    carto.setDefaultAuth({
        user: 'cartogl',
        apiKey: 'default_public'
    });
    // Create the source
    const source = new carto.source.Dataset('ne_10m_populated_places_simple');
    // Create an empty viz
    const viz = new carto.Viz();
    // Create the layer
    const layer = new carto.Layer('layer', source, viz);
    // Add the layer to the map
    layer.addTo(map);
  </script>
</body>
</html>
```
</details>

To show your CARTO data you need to create a CARTO account and get your [credentials](https://carto.com/developers/fundamentals/authorization/).

Since your CARTO data is going to be secured the first thing you need to do is to [autenticate the client](https://carto.com/developers/carto-vl/reference/#cartosetdefaultauth) with your user and apiKey.

```js
carto.setDefaultAuth({
    user: 'cartogl',
    apiKey: 'default_public'
});
```

Then we pick some data from our CARTO account to be displayed in the map, in this case we create a [source](https://carto.com/developers/carto-vl/reference/#cartosourcedataset) from a dataset named `ne_10m_populated_places_simple` that contains information about populated places in the earth.

```js
const source = new carto.source.Dataset('ne_10m_populated_places_simple');
``` 

Then we create a [layer](https://carto.com/developers/carto-vl/reference/#cartolayer) using this source and an empty [viz](https://carto.com/developers/carto-vl/reference/#cartoviz) object.

```js
const viz = new carto.Viz();
const layer = new carto.Layer('layer', source, viz);
```

Once we have the layer we just need to use the [addTo](https://carto.com/developers/carto-vl/reference/#cartolayeraddto) method to add it to the map.

```js
layer.addTo(map);
```

## Basic styling

<details>
<summary>Full example</summary>

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Include CARTO VL JS -->
  <script src="https://cartodb-libs.global.ssl.fastly.net/carto-vl/v0.3.0/carto-vl.js"></script>
  <!-- Include Mapbox GL JS -->
  <script src="https://cartodb-libs.global.ssl.fastly.net/mapbox-gl/v0.44.1-carto1/mapbox-gl.js"></script>
  <!-- Include Mapbox GL CSS -->
  <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.44.1/mapbox-gl.css" rel="stylesheet" />
  <!-- Make the map visible -->
  <style>
    #map {
      height: 100%;
      width: 100%;
    }
  </style>
</head>
<body>
  <!-- Map goes here -->
  <div id="map"></div>
  <script>
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [0, 30],
      zoom: 2,
      dragRotate: false
    });
    // Autenticate the client
    carto.setDefaultAuth({
        user: 'cartogl',
        apiKey: 'default_public'
    });
    // Create the source
    const source = new carto.source.Dataset('ne_10m_populated_places_simple');
    // Create a viz with some styles
    const viz = new carto.Viz(`
        color: red
        width: 10
    `);
    // Create the layer
    const layer = new carto.Layer('layer', source, viz);
    // Add the layer to the map
    layer.addTo(map);
  </script>
</body>
</html>
```
</details>

One of the strongest points of CARTO VL is the ability to define very powerful visualizations through the [viz object](https://carto.com/developers/carto-vl/reference/#cartoviz). In this guide we are only covering a very basic example of how to change the color of the points.  Instead creating an empty `viz` object we create the viz as the following in order to get red points with a width of 10 pixels.

```js
const viz = new carto.Viz(`
    color: red
    width: 10
`);
```
