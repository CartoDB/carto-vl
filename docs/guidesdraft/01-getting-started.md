## Getting started

### Introduction

Welcome to the CARTO VL guides! This documentation is meant to lead you from the basics of creating a map to advanced techniques for developing powerful interactive visualizations.

In this guide, you will learn how to visualize information with CARTO VL by displaying a dataset on the top of a world basemap. If there is any word or term you do not understand while reading the guides, please take a look to our [Glossary](https://carto.com/developers/carto-vl/guides/glossary).

### Previous requirements

There are no previous requirements to complete this guide, but a basic knowledge of HTML, CSS and JavaScript would be helpful. In order to start creating maps, you will need text editor and an Internet connection.

### What is CARTO VL?

[CARTO VL](https://github.com/cartodb/carto-vl) is a JavaScript library to create custom location intelligence applications that leverage the power of [CARTO](https://carto.com/). It uses [WebGL](https://www.khronos.org/webgl/) to enable powerful vector maps.

It relies on [Mapbox GL](https://www.mapbox.com/mapbox-gl-js/api) to render the basemaps. Mapbox GL can be used for other functionality too, read [Mapbox GL documentation](https://www.mapbox.com/mapbox-gl-js/api/) for more information. However, keep in mind that CARTO VL layers can only be controlled with the [CARTO VL API]() and that Mapbox GL native layers can **only** be controlled with the Mapbox GL API. Therefore, CARTO VL expressions cannot be used for Mapbox GL layers and vice versa.

### Basic setup

<div class="example-map">
    <iframe 
        id="getting-started-basic-styling-map"
        src="https://carto.com/developers/carto-vl/examples/maps/guides/getting-started/basic-styling.html" 
        width="100%"
        height="500" 
        frameBorder="0">
    </iframe>
</div>

```html
<head>
  <!-- Include CARTO VL JS -->
  <script src="https://libs.cartocdn.com/carto-vl/%VERSION%/carto-vl.js"></script>
  <!-- Include Mapbox GL JS -->
  <script src="https://libs.cartocdn.com/mapbox-gl/v0.48.0-carto1/mapbox-gl.js"></script>
  <!-- Include Mapbox GL CSS -->
  <link href="https://libs.cartocdn.com/mapbox-gl/v0.48.0-carto1/mapbox-gl.css" rel="stylesheet" />
</head>
```

The easiest way to use CARTO VL is to include the required files from our CDN as you see in the example above: `https://libs.cartocdn.com/carto-vl/%VERSION%/carto-vl.js`. If you prefer to use the minified file, which is lighter and therefore loads faster, you can use `https://libs.cartocdn.com/carto-vl/%VERSION%/carto-vl.min.js`.

Then, you will need to add Mapbox GL JavaScript and CSS files. This will let you use both `carto` and `mapboxgl` in your code.

> Currently, not every Mapbox GL version is compatible with CARTO VL. We highly recommend the following combination. If you are importing CARTO VL from npm, you have to use our Mapbox GL fork. Read more about how to do this in [the advanced guide](https://carto.com/developers/carto-vl/guides/advanced)

Create a `div` where the map is going to be drawn.

```html
  <div id="map"></div>
```

Style the `div` to ensure it will be displayed correctly.

```css
#map {
    position: absolute;
    height: 100%;
    width: 100%;
}
```

#### Defining the basemap

Once you have the `div`, you have use the `mapboxgl` object to initialize your map using the following parameters:

- **`container`** indicates where the map is going to be placed
- **`style`** contains the information about the basemap
- **`center`** indicates the area of the world that is going to be visualized
- **`zoom`** defines the default zoom level
- **`dragRotate`** disables the map rotation

```js
const map = new mapboxgl.Map({
      container: 'map',
      style: carto.basemaps.voyager,
      center: [0, 30],
      zoom: 2,
      dragRotate: false
    });
```

For basemaps you can add [Mapbox custom styles](https://www.mapbox.com/mapbox-gl-js/style-spec/) or choose one of the three predefined styles offered by CARTO:

- **Voyager:** `carto.basemaps.voyager` [https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json](https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json)
- **Positron:** `carto.basemaps.positron` [https://basemaps.cartocdn.com/gl/positron-gl-style/style.json](https://basemaps.cartocdn.com/gl/positron-gl-style/style.json)
- **Dark Matter:** `carto.basemaps.darkmatter` [https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json](https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json)

At this point you will have a basic map:

<div class="example-map">
    <iframe 
        id="getting-started-basic-styling-map"
        src="https://carto.com/developers/carto-vl/examples/maps/guides/getting-started/basic-setup.html" 
        width="100%"
        height="500" 
        frameBorder="0">
    </iframe>
</div>

### Defining the source

In order to render data from CARTO you need to create a CARTO account and then get the necessary [credentials](https://carto.com/developers/fundamentals/authorization/).

The first thing you need to do is [authenticate the client](https://carto.com/developers/carto-vl/reference/#cartosetdefaultauth) with your `user` and `apiKey`. For guides and examples, we provide a public CARTO account that you can use to try out the library:

```js
carto.setDefaultAuth({
    user: 'cartovl',
    apiKey: 'default_public'
});
```

The next step is to define the [`source`](# TODO) from your account to be displayed on the map. In the example below, the `source` is a dataset named `populated_places` with all the populated places around the world.

```js
const source = new carto.source.Dataset('populated_places');
```

### Defining the Viz object

A [`Viz object`](https://carto.com/developers/carto-vl/reference/#cartoviz) is one of the core elements of CARTO VL. It defines how the data will be styled, displayed, and processed. In this case you have to create an empty Viz object, that will use the style set by default.

```js
const viz = new carto.Viz();
```

### Defining the layer

Now that you have defined a `source` and a `Viz object`, you need to create a new [`layer`](https://carto.com/developers/carto-vl/reference/#cartolayer) that can be added to the map.

```js
const layer = new carto.Layer('layer', source, viz);
```

Once you have the layer, you need to use the [`addTo`](https://carto.com/developers/carto-vl/reference/#cartolayeraddto) method to add it to the map.

```js
layer.addTo(map);
```

### Styling the map

Using the Viz object you can decide how to visualize your data.

The following Viz object changes the color and size of the points on your map.

```js
const viz = new carto.Viz(`
    color: red
    width: 10
`);
```

For more information about styling, check out the guide [Introduction to Styling](https://carto.com/developers/carto-vl/guides/introduction-to-styling/).

### All together

<div class="example-map">
    <iframe 
        id="getting-started-basic-styling-map"
        src="https://carto.com/developers/carto-vl/examples/maps/guides/getting-started/basic-styling.html" 
        width="100%"
        height="500" 
        frameBorder="0">
    </iframe>
</div>

```html
<!DOCTYPE html>
<html>

<head>
    <!-- Include CARTO VL JS -->
    <script src="https://libs.cartocdn.com/carto-vl/%VERSION%/carto-vl.min.js"></script>
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
    <!-- Map goes here -->
    <div id="map"></div>
    <script>
        const map = new mapboxgl.Map({
            container: 'map',
            style: carto.basemaps.voyager,
            center: [0, 30],
            zoom: 2,
            dragRotate: false,
        });

        // Autenticate the client
        carto.setDefaultAuth({
            user: 'cartovl',
            apiKey: 'default_public'
        });

        // Create the source
        const source = new carto.source.Dataset('populated_places');

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
