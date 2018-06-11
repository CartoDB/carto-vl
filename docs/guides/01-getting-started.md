## Getting started

### Basic structure

[CARTO VL](https://github.com/cartodb/carto-vl) is a JavaScript library to create custom location intelligence applications that leverage the power of [CARTO](https://carto.com/). It uses [WebGL](https://www.khronos.org/webgl/) to enable powerful vector maps.

The easiest way to use CARTO VL is to include the required files from our CDN. This will add the `carto` and the `mapboxgl` objects to the global namespace.

```html
<head>
  <!-- Include CARTO VL JS -->
  <script src="https://libs.cartocdn.com/carto-vl/v0.4.0/carto-vl.js"></script>
  <!-- Include Mapbox GL JS -->
  <script src="https://libs.cartocdn.com/mapbox-gl/v0.45.0-carto1/mapbox-gl.js"></script>
  <!-- Include Mapbox GL CSS -->
  <link href="https://libs.cartocdn.com/mapbox-gl/v0.45.0-carto1/mapbox-gl.css" rel="stylesheet" />
</head>
```

Create a `div` where the map is going to be drawn. In this case we are giving the `div` a map `id`.

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

### Defining the basemap

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

At this point you will have a basic map ([example](http://carto.com/developers/carto-vl/examples/maps/guides/getting-started/basemap.html)).

### Defining the source

In order to render data from CARTO you first need to create a CARTO account and then get the necessary [credentials](https://carto.com/developers/fundamentals/authorization/).

By default your CARTO data is secured. So the first thing you need to do is [authenticate the client](https://carto.com/developers/carto-vl/reference/#cartosetdefaultauth) with your `user` and `apiKey`.

```js
carto.setDefaultAuth({
    user: 'cartogl',
    apiKey: 'default_public'
});
```

The next step is to define the [`source`](https://carto.com/developers/carto-vl/reference/#cartosourcedataset) from your account to be displayed on the map. In the example below we are defining the `source` for a dataset named `ne_10m_populated_places_simple` with all the populated places around the world.

```js
const source = new carto.source.Dataset('ne_10m_populated_places_simple');
```

### Defining the layer

Now that we have defined our `source`, we need to define it as a [`layer`](https://carto.com/developers/carto-vl/reference/#cartolayer) that can be accessed by CARTO VL.

```js
const layer = new carto.Layer('layer', source, viz);
```

Once we have the layer we need to use the [`addTo`](https://carto.com/developers/carto-vl/reference/#cartolayeraddto) method to add it to the map [example](http://carto.com/developers/carto-vl/examples/maps/guides/getting-started/addingData.html).

```js
layer.addTo(map);
```

### Defining the style

To define a style we need a [`viz`](https://carto.com/developers/carto-vl/reference/#cartoviz) object.

```js
const viz = new carto.Viz();
```

The example below demonstrates how to change the color and size of the points on our map ([example](http://carto.com/developers/carto-vl/examples/maps/guides/getting-started/basicStyling.html)).

```js
const viz = new carto.Viz(`
    color: red
    width: 10
`);
```

For more information about styling, check out the guide [Introduction to Styling](https://carto.com/developers/carto-vl/guides/introduction-to-styling/).
