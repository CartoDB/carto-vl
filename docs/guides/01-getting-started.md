## Getting started

In this guide, you will learn the basics of visualizing data with CARTO VL on top of a world [basemap](https://carto.com/help/glossary/#basemap). There are no previous requirements to complete this guide, but a basic knowledge of HTML, CSS and JavaScript would be helpful.

After completing this guide, you will have your first CARTO VL map!

<div class="example-map">
    <iframe
        id="getting-started-final-result"
        src="/developers/carto-vl/examples/maps/guides/getting-started/step-2.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

### Basic setup

The most straight-forward way to use CARTO VL is to include the required files from our CDN as seen in the code below. You will also need to add Mapbox GL JavaScript and CSS files.

```html
<head>
  <!-- Include CARTO VL JS from the CARTO CDN-->
  <script src="https://libs.cartocdn.com/carto-vl/%VERSION%/carto-vl.min.js"></script>

  <!-- Include Mapbox GL from the Mapbox CDN-->
  <script src="https://api.tiles.mapbox.com/mapbox-gl-js/v0.52.0/mapbox-gl.js"></script>
  <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.52.0/mapbox-gl.css" rel="stylesheet" />
</head>
```
**Note:**
**Mapbox GL**: CARTO VL is not compatible with every version. We recommend using the same version that we use in the [examples](/developers/carto-vl/examples/). However, every version from **`v0.50.0`** should work. Historically, we provided patched MGL bundles, but this is no longer required.

**Note:**
**Developers**: if you have experience with `npm` and a build system in your project (*webpack*, *rollup*...), you can install CARTO VL library with `npm install @carto/carto-vl`. You can import it with `import carto from '@carto/carto-vl'` and then you will have access to an already babelified version of the library, ready to be used.

#### Add map container

Next, you need to create a `div` where the map will be drawn:

```html
  <div id="map"></div>
```

Style the map `div` to ensure the map displays properly:

```css
#map {
    position: absolute;
    height: 100%;
    width: 100%;
}
```

#### Add basemap and set properties

Once you have a `div` for your map, you have to use the [`mapboxgl.Map`](https://www.mapbox.com/mapbox-gl-js/api/#map) constructor to create a new map with the following parameters:

- **`container`**: [element ID](https://developer.mozilla.org/en-US/docs/Web/API/Element/id) to indicate where the map is going to be placed
- **`style`**: sets the basemap style to use
- **`center`**: sets the opening center coordinates of the map (longitude, latitude)
- **`zoom`**: sets the default zoom level of the map

```js
const map = new mapboxgl.Map({
      container: 'map',
      style: carto.basemaps.voyager,
      center: [0, 30],
      zoom: 2
    });
```

For the basemap `style` parameter, you can add either [Mapbox custom styles](https://www.mapbox.com/mapbox-gl-js/style-spec/) or one of the three predefined styles offered by CARTO:

- **Voyager**: `carto.basemaps.voyager` (see style details at [voyager-gl-style](https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json))
- **Positron**: `carto.basemaps.positron` ([positron-gl-style](https://basemaps.cartocdn.com/gl/positron-gl-style/style.json))
- **Dark Matter**: `carto.basemaps.darkmatter` ([dark-matter-gl-style](https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json))

At this point you will have a basic map with *Voyager* as the base, that opens at zoom level 2 and centered on the world:

<div class="example-map">
    <iframe
        id="getting-started-step-1"
        src="/developers/carto-vl/examples/maps/guides/getting-started/step-1.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
> View this step [here](/developers/carto-vl/examples/maps/guides/getting-started/step-1.html)

### Define user

In order to render data from CARTO you need to create a CARTO account and then get the necessary [credentials](/developers/fundamentals/authorization/).

The first thing you need to do is [authenticate the client](/developers/carto-vl/reference/#cartosetdefaultauth) with your `username` and `apiKey`. For guides and examples, we provide a public CARTO account that you can use to try out the library:

```js
carto.setDefaultAuth({
    username: 'cartovl',
    apiKey: 'default_public'
});
```

### Create source

The next step is to define the [`source`](/developers/carto-vl/guides/add-data-sources) from your account to be displayed on the map. In the example below, the `source` is a dataset named `populated_places` with all the most populated places around the world from [Natural Earth](https://www.naturalearthdata.com/).

```js
const source = new carto.source.Dataset('populated_places');
```

### Create Viz object

A [`Viz object`](/developers/carto-vl/reference/#cartoviz) is one of the core elements of CARTO VL. It defines how the data will be styled and displayed on your map.

Create an empty `Viz` object that uses the default CARTO VL styling:

```js
const viz = new carto.Viz();
```

### Create map layer

Now that you have created a `source` and a `Viz object`, you need to create a new [`layer`](/developers/carto-vl/reference/#cartolayer) that can be added to the map.

```js
const layer = new carto.Layer('layer', source, viz);
```

### Add map layer

Once you have created the `layer`, you need to use the [`addTo`](/developers/carto-vl/reference/#cartolayeraddto) method to add it to the map.

```js
layer.addTo(map);
```

### Defining a custom style for the Viz object

Instead of using the `Viz` object you created in a previous step, with the default values, we can set custom values for the `color` and `size` of the points on your map:

```js
const viz = new carto.Viz(`
    color: purple
    width: 5
`);
```

For more information about styling, check out the guide [Style with Expressions](/developers/carto-vl/guides/style-with-expressions/).

### All together

<div class="example-map">
    <iframe
        id="getting-started-step-2"
        src="/developers/carto-vl/examples/maps/guides/getting-started/step-2.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>

> You can explore the final step [here](/developers/carto-vl/examples/maps/guides/getting-started/step-2.html)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <script src="https://libs.cartocdn.com/carto-vl/%VERSION%/carto-vl.min.js"></script>
    <script src="https://api.tiles.mapbox.com/mapbox-gl-js/v0.52.0/mapbox-gl.js"></script>
    <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.52.0/mapbox-gl.css" rel="stylesheet" />
    <link rel="stylesheet" type="text/css" href="../../style.css">
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
            zoom: 2
        });

        //** CARTO VL functionality begins here **//

        // Define user
        carto.setDefaultAuth({
            username: 'cartovl',
            apiKey: 'default_public'
        });

        // Define source
        const source = new carto.source.Dataset('populated_places');

        // Define Viz object and custom style
        const viz = new carto.Viz(`
            color: purple
            width: 5
        `);

        // Define map layer
        const layer = new carto.Layer('layer', source, viz);

        // Add map layer
        layer.addTo(map);
    </script>
</body>
</html>
```
