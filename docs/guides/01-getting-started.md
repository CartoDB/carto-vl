## Getting started

### Basic structure

[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/getting-started/basemap.html)

[CARTO VL](https://github.com/cartodb/carto-vl) is a JavaScript library to create custom location intelligence applications that leverage the power of [CARTO](https://carto.com/). It uses [WebGL](https://www.khronos.org/webgl/) to enable powerful **Vector maps**.

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

Remember to style this div to ensure it will be displayed correctly.

```css
#map {
    position: absolute;
    height: 100%;
    width: 100%;
}
```

### Displaying the basemap

Once we have the div, we use the `mapboxgl` object to initialize our map.

```js
const map = new mapboxgl.Map({
      center: [0, 30],
      container: 'map',
      dragRotate: false
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      zoom: 2,
    });
```

- `container` is the id of the div where the map is going to be placed.
- `center` indicates the area of the world we are going to visualize.
- `dragRotate` disables the map rotation (coming soon)
- `style` contains the information about the basemap.
- `zoom` defines the default zoom level  

For basemaps you can add [Mapbox custom styles](https://www.mapbox.com/mapbox-gl-js/style-spec/) or choose one of the three predefined styles offered by CARTO:

- Voyager: https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json
- Positron: https://basemaps.cartocdn.com/gl/positron-gl-style/style.json
- Dark Matter: https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json

Once you get to this point you should see a basic map.

### Adding data from CARTO

[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/getting-started/addingData.html)

To render your CARTO data you need to create a CARTO account and get your [credentials](https://carto.com/developers/fundamentals/authorization/).

Since your CARTO data is going to be secured the first thing you need to do is to [authenticate the client](https://carto.com/developers/carto-vl/reference/#cartosetdefaultauth) with your user and apiKey.

```js
carto.setDefaultAuth({
    user: 'cartogl',
    apiKey: 'default_public'
});
```

Then we pick some data from our CARTO account to be displayed in the map, in this case we create a [source](https://carto.com/developers/carto-vl/reference/#cartosourcedataset) from a dataset named `ne_10m_populated_places_simple` that contains information about populated places around the world.

```js
const source = new carto.source.Dataset('ne_10m_populated_places_simple');
```

### Defining layers

Now that we have selected our source table, the next step is to turn it into a [layer](https://carto.com/developers/carto-vl/reference/#cartolayer) that can be accessed by CARTO VL and an empty [viz](https://carto.com/developers/carto-vl/reference/#cartoviz) object where we will define the layer's style.

```js
const viz = new carto.Viz();
const layer = new carto.Layer('layer', source, viz);
```

Once we have the layer we need to use the [addTo](https://carto.com/developers/carto-vl/reference/#cartolayeraddto) method to add it to the map.

```js
layer.addTo(map);
```

### Basic styling

[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/getting-started/basicStyling.html)

One of the strongest points of CARTO VL is the ability to define very powerful visualizations through the [viz object](https://carto.com/developers/carto-vl/reference/#cartoviz). In this guide we are only covering a very basic example of how to change the color of the points. Instead creating an empty `viz` object we create the viz as the following in order to get red points with a width of 10 pixels.

```js
const viz = new carto.Viz(`
    color: red
    width: 10
`);
```

For more information about styling, check out the guide [Introduction to Styling](https://carto.com/developers/carto-vl/guides/introduction-to-styling/).
