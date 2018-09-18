## Getting started

### Introduction

[CARTO VL](https://github.com/cartodb/carto-vl) is a JavaScript library to create custom location intelligence applications that leverage the power of [CARTO](https://carto.com/). It uses [WebGL](https://www.khronos.org/webgl/) to enable powerful vector maps.

It relies on [Mapbox GL](https://www.mapbox.com/mapbox-gl-js/api) to render the basemaps and it can be used for other functionality too, read [Mapbox GL documentation](https://www.mapbox.com/mapbox-gl-js/api/) for more information. However, keep in mind that CARTO VL layers can only be controlled with the CARTO VL API (this documentation) and that Mapbox GL native layers can only be controlled with the Mapbox GL API. Therefore, CARTO VL expressions cannot be used for Mapbox GL layers and vice versa.

### Basic set up

The easiest way to use CARTO VL is to include the required files from our CDN:

* CARTO VL library: https://libs.cartocdn.com/carto-vl/%VERSION%/carto-vl.js
* Minified file: https://libs.cartocdn.com/carto-vl/%VERSION%/carto-vl.min.js

Then, we will need to add Mapbox GL JavaScript and CSS files.

```html
<head>
  <!-- Include CARTO VL JS -->
  <script src="https://libs.cartocdn.com/carto-vl/%VERSION%/carto-vl.min.js"></script>
  <!-- Include Mapbox GL JS -->
  <script src="https://libs.cartocdn.com/mapbox-gl/v0.48.0-carto1/mapbox-gl.js"></script>
  <!-- Include Mapbox GL CSS -->
  <link href="https://libs.cartocdn.com/mapbox-gl/v0.48.0-carto1/mapbox-gl.css" rel="stylesheet" />
</head>
```

This will add the `carto` and the `mapboxgl` objects to the global namespace.

> Note: Not every Mapbox GL version is compatible with CARTO VL. We highly recommend the following combination. If you are importing CARTO VL from npm, you have to use our Mapbox GL fork. Read more about how to do this in [the advanced guide]((https://carto.com/developers/carto-vl/guides/advanced))

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

Once we have the `div`, we use the `mapboxgl` object to initialize our map using the following parameters:

- **`container`** indicates where the map is going to be placed
- **`style`** contains the information about the basemap
- **`center`** indicates the area of the world we are going to visualize
- **`zoom`** defines the default zoom level
- **`dragRotate`** disables the map rotation

```js
const map = new mapboxgl.Map({
      container: 'map',
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [0, 30],
      zoom: 2,
      dragRotate: false
    });
```

For basemaps you can add [Mapbox custom styles](https://www.mapbox.com/mapbox-gl-js/style-spec/) or choose one of the three predefined styles offered by CARTO:

- **Voyager:** https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json
- **Positron:** https://basemaps.cartocdn.com/gl/positron-gl-style/style.json
- **Dark Matter:** https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json

At this point you will have a basic map:

[LiveExample](http://carto.com/developers/carto-vl/examples/maps/guides/getting-started/basic-set-up.html)

### Defining the source

In order to render data from CARTO you need to create a CARTO account and then get the necessary [credentials](https://carto.com/developers/fundamentals/authorization/).

The first thing you need to do is [authenticate the client](https://carto.com/developers/carto-vl/reference/#cartosetdefaultauth) with your `user` and `apiKey`.

```js
carto.setDefaultAuth({
    user: 'cartovl',
    apiKey: 'default_public'
});
```

The next step is to define the [`source`](https://carto.com/developers/carto-vl/reference/#cartosourcedataset) from your account to be displayed on the map. In the example below we are defining the `source` for a dataset named `populated_places` with all the populated places around the world.

```js
const source = new carto.source.Dataset('populated_places');
```

### Defining the Viz object

A [`Viz object`](https://carto.com/developers/carto-vl/reference/#cartoviz) is one of the core elements of CARTO VL. It defines how the data will be styled, displayed, and processed. In this case we create an empty Viz object, that will use the default style.

```js
const viz = new carto.Viz();
```

### Defining the layer

Now that we have defined our `source` and a `Viz object`, we need to create a new [`layer`](https://carto.com/developers/carto-vl/reference/#cartolayer) that can be added to the map.

```js
const layer = new carto.Layer('layer', source, viz);
```

Once we have the layer we need to use the [`addTo`](https://carto.com/developers/carto-vl/reference/#cartolayeraddto) method to add it to the map.
[Live Example](http://carto.com/developers/carto-vl/examples/maps/guides/getting-started/adding-data.html)

```js
layer.addTo(map);
```

### Styling the map

Using the Viz object you can decide how to visualize your data.

The following Viz object changes the color and size of the points on our map.

```js
const viz = new carto.Viz(`
    color: red
    width: 10
`);
```

For more information about styling, check out the guide [Introduction to Styling](https://carto.com/developers/carto-vl/guides/introduction-to-styling/).

### All together

[Live Example](http://carto.com/developers/carto-vl/examples/maps/guides/getting-started/basic-styling.html)