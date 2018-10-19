## Zoom-based Styling

An inherent feature of any map viewed on the web is the ability to zoom in and out. Each time you zoom in or out of a map, you are viewing a different _zoom level_. At each zoom level or range of zoom levels, there are important design considerations for how data are visualized and/or what information is displayed.

With any map, the decisions that you as the map designer make are critical to the interpretability of your map by the end user. The zoom-based styling decisions that you make should be determined by the story you want to tell, the data that you are mapping, and the zoom levels at which your map will be viewed.

We most often hear about zoom-based styling in the context of basemaps. As an example, if we look at one of CARTO’s basemaps, Voyager, across different zoom levels, we see that as the zoom level gets larger (zooming into the map), more features and labels are added. As these features and labels appear, their styling is adjusted to support the current view.

For example, major highways don’t display until zoom 5 and when they do, the appearance transitions from a single, small width line at low zoom levels to cased lines at larger zoom levels.

<div class="box-textMediaa">
    <img src="/developers/carto-vl/examples/guides/zoom-based-styling/multi-scale-voyager.gif" alt="Multi-scale GIF of Voyager">
</div>

**Note:**
CARTO VL renderer provides a native/built-in way to do zoom-based styling without popping (by interpolating), which results in smooth transitions.


### Zoom-based styling with VL

In the past, zoom-based styling has been overly complex creating a barrier of entry for many. It is no wonder that it was “easier” to put too much information on a map and/or only design a map for one zoom level.

That’s not the case with CARTO VL.

In this guide, we will demonstrate how this complexity has been greatly reduced and introduce _our_ concept of zoom-based styling. By the end of this guide, you will learn how to take advantage of these features and start making a whole new kind of multi-scale thematic map!

### Overview

Using a [street trees](https://data.vancouver.ca/datacatalogue/streetTrees.htm) dataset from the City of Vancouver, we will first explore the following zoom-based functionalities:

- [`scaled`](/developers/carto-vl/reference/#cartoexpressionsscaled): how to keep symbol sizes consistent through zoom level.
- [`zoomRange`](/developers/carto-vl/reference/#cartoexpressionszoomrange): how to introduce detail through zoom across multiple visualization properties.
- [`zoom`](/developers/carto-vl/reference/#cartoexpressionszoom): how to filter the amount or type of data that is visible at each zoom.

After we explore each one independently, we will bring them together to create a map like this one (go ahead, zoom in and out!):
<div class="example-map">
    <iframe
        id="guides-zoom-based-styling-step-8"
        src="/developers/carto-vl/examples/guides/zoom-based-styling/step-8.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

### Getting started

To get started, copy and paste the code below into your favorite text editor and save it to a file `vancouver-trees.html`.

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">

    <script src='https://libs.cartocdn.com/carto-vl/%VERSION%/carto-vl.min.js'></script>

    <script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.50.0/mapbox-gl.js'></script>
    <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.50.0/mapbox-gl.css' rel='stylesheet' />

    <link rel="stylesheet" type="text/css" href="../../style.css">
</head>

<body>
    <!-- Add map container -->
    <div id="map"></div>
    <script>
        // Add basemap and set properties
        const map = new mapboxgl.Map({
            container: 'map',
            style: carto.basemaps.darkmatter,
            center: [-123.098599, 49.240685],
            zoom: 11,
            dragRotate: false,
        });

        // Add zoom controls
        const nav = new mapboxgl.NavigationControl();
        map.addControl(nav, 'top-left');

        //** CARTO VL functionality begins here **//

        // Define user
        carto.setDefaultAuth({
            username: 'cartovl',
            apiKey: 'default_public'
        });

        // Define source
        const source = new carto.source.Dataset('vancouver_trees');

        // Define Viz object and custom style
        const viz = new carto.Viz(`
                color: green
        `);

        // Define map layer
        const layer = new carto.Layer('layer', source, viz);

        // Add map layer
        layer.addTo(map,'watername_ocean');
    </script>
</body>

</html>
```

Next, test that the map loads by opening the file in your web browser of choice. When loaded, the map should look like this:

<div class="example-map">
    <iframe
        id="guides-zoom-based-styling-step-1"
        src="/developers/carto-vl/examples/guides/zoom-based-styling/step-1.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

### Adjust symbol size

As we can see on the map, there are a lot of trees in Vancouver!

To better visualize the high density of information, let's override the default point `width` and set it to `1` and set the `strokeWidth` to `0.5`:

```js
        const viz = new carto.Viz(`
                color: white
                width: 1
                strokeColor: green
                strokeWidth: 0.5
        `);
```

With these adjustments, we can more clearly see the distribution of trees around the city:

<div class="example-map">
    <iframe
        id="guides-zoom-based-styling-step-2"
        src="/developers/carto-vl/examples/guides/zoom-based-styling/step-2.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

### Scale symbol size

Take a few minutes to zoom in and out of the map above. What you will notice is that the style modifications we made function at our opening zoom of `11` and smaller, but begin to break down as we zoom in.

That's because styling that works well at _one_ zoom level doesn't always work well at _all_ zoom levels.

Let's say we are satisfied with how a `1` point symbol size looks at our opening zoom of `11`, we can use those two pieces of information as our anchor inside of `scaled`. This will keep symbol sizes constant (in real space) through zoom.

Let's give it a try by adding this information to the `width` property:

```js
width: scaled(1,11)
```

In the resulting map, as we zoom in and out, you'll notice that the `1` point symbol size that we defined, scales based on the current zoom level:

<div class="example-map">
    <iframe
        id="guides-zoom-based-styling-step-3"
        src="/developers/carto-vl/examples/guides/zoom-based-styling/step-3.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

If you aren't satisfied with the result, try adjusting the anchor scale and/or point width. For example, adjust the `width` style to `scaled(1,15)`. You can also use this functionality with `strokeWidth` to scale the outline of the points.

### Define a range of symbol sizes

As demonstrated above, the `scaled` option is great to keep symbol sizes consistent through zoom. There are other times where you will want finer control at every zoom level and/or at a range of zoom levels.

Next, let's take a look at how we can use the `zoomRange` expression inside of a `ramp` to accomplish that.

In the previous step, we determined that a width of `1` worked well at our opening zoom of `11` but noticed in previous steps, as we zoom in, the size of `1` doesn't hold up well.

We can use the results of this visual examination to set different widths by zoom:

```js
width: ramp(zoomrange([12,18]),[1,20])
```

This sets the width of our symbols to `1` at zoom levels less than or equal to `12` and `20` at zoom levels greater than or equal to `18`. All other sizes (between zooms `12` and `18`) are interpolated between the anchor sizes of `1` and `20`. You can add additional breakpoints to fine-tune your map even further.

<div class="example-map">
    <iframe
        id="guides-zoom-based-styling-step-4"
        src="/developers/carto-vl/examples/guides/zoom-based-styling/step-4.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

We can use the same logic for `strokeWidth`:

```js
strokeWidth: ramp(zoomrange([12,18]),[0.5,2])
```

As described above for any width property, symbol sizes are interpolated between the defined zoom ranges inside of the `ramp`. This is the same behavior for color.

To demonstrate, add the style for point color and stroke color below to your map:

```js
color: ramp(zoomrange([12,18]),[white,green])
strokeColor: ramp(zoomrange([12,18]),[green,white])
```
As you zoom in on the map, look closely at the point and stroke colors.

At zooms less than `12` the point color is `white` and the stroke color is `green`. At zooms greater than `18` we are flipping the fill and stroke colors.  You will know that you are at zoom `18` when the points are green with a white outline. As you zoom in, you will notice that there is a transition in color happening. This is where the interpoation is taking place.

<div class="example-map">
    <iframe
        id="guides-zoom-based-styling-step-5"
        src="/developers/carto-vl/examples/guides/zoom-based-styling/step-5.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

While the examples above only set styles for two zooms, you can add more zoom levels and style conditions.

Give it a try! Add in some additional stops to any of the styles above to see what the possibilities are.

### Set feature visibility by zoom

Up until now, we have looked at ways to modify the _appearance_ of features based on zoom. Next, we'll explore ways to control the _visibility_ of features to introduce more detail as we zoom in to the map, and remove detail as we zoom out.

We will look at two different ways this can be done. First, with `zoomrange` and then with `zoom`.

As we saw in the previous step, using `zoomrange`, inside of a `ramp` allows us to define particular styles at a variety of zoom levels. We can use this functionality inside of a `filter` as well to set criteria for when features appear and disappear through zoom.

To demonstrate, we will use an attribute, `diameter` in the Vancouver trees dataset to control the visibility of trees, by zoom, based on this measurement.

To better visualize the points appearing through zoom, first let's classify the data using `globalQuantiles`, `7` class breaks, and color each class with the CARTOColor scheme `sunset`:

```js
   color: ramp(globalQuantiles($diameter,7),sunset)
   width: ramp(zoomrange([12,18]),[1,20])
   strokeWidth: 0
```
Next, we'll add a `filter` and set our `diameter` criteria with `zoomrange` where we gradually introduce larger trees until zoom `16` and greater, where we display all trees (`true`):

```js
filter:ramp(zoomrange([12,13,14,15,16]),
            [$diameter>30,
            $diameter>20,
            $diameter>15,
            $diameter>10,
            true]
        )
```

As you zoom in and out of the resulting map, you will notice that the colors (purple for high values to yellow for low values) begin to appear on the map based on the filter we defined above.

<div class="example-map">
    <iframe
        id="guides-zoom-based-styling-step-6"
        src="/developers/carto-vl/examples/guides/zoom-based-styling/step-6.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

Let's explore this further using [`zoom`](https://carto.com/developers/carto-vl/reference/#cartoexpressionszoom) with the [`filter`](https://carto.com/developers/carto-vl/reference/#cartoexpressions) property.

Using the same map from above, replace the `filter` styling with:

```js
filter: zoom()>15 or $diameter>30
```

With this filter, all points will draw when both criteria are met. This means that at zoom levels less than `15`, only trees that have a diameter of greater than `30` will draw. Once we hit zooms `15` and larger, all points draw.

<div class="example-map">
    <iframe
        id="guides-zoom-based-styling-step-7"
        src="/developers/carto-vl/examples/guides/zoom-based-styling/step-7.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

Which method you use depends on whether you want to introduce detail incrementally (`zoomrange`) or whether there is a more general (`zoom()`) filter that can be applied through zoom.

### Bringing it together

As described at the beginning of the guide, with basemap design, features are introduced as they are relevant and designed according to the zoom at which they are being viewed. In this guide we've explored a variety of ways to do the same with CARTO VL.

The final example in this guide demonstrates how to combine zoom-based filters and zoom-based styling and introduce multiple characteristics of a dataset through zoom.

Take a look at the map, zoom in and out to see the changes in the styling and visibility of features:

<div class="example-map">
    <iframe
        id="guides-zoom-based-styling-step-8"
        src="/developers/carto-vl/examples/guides/zoom-based-styling/step-8.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

Pretty neat, right?!

This is an example of how to take advantage of zoom-based styling for multiple visualization properties, to introduce thematic information through zoom.

Using zoom-based filters to introduce detail, the map opens with all visible trees colored green and sized to suit the density of information and view. As the zoom level increases, the color of trees transitions from green to a categorical coloring based on its `common_name`. At the next set of zoom levels, another attribute (`diameter`) is introduced by changing the sizing of features and setting an anchor for that sizing using `scaled`. Other properties like `strokeColor` and `strokeWidth` are also adjusted through zoom to compliment the multi-scale styling of the trees.

If you would like to take a closer look, the full code for the example is here:

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">

    <script src='https://libs.cartocdn.com/carto-vl/%VERSION%/carto-vl.min.js'></script>

    <script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.50.0/mapbox-gl.js'></script>
    <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.50.0/mapbox-gl.css' rel='stylesheet' />

    <link rel="stylesheet" type="text/css" href="../../style.css">
</head>

<body>
    <!-- Add map container -->
    <div id="map"></div>
    <script>
        // Add basemap and set properties
        const map = new mapboxgl.Map({
            container: 'map',
            style: carto.basemaps.darkmatter,
            center: [-123.098599, 49.240685],
            zoom: 11,
            dragRotate: false,
        });

        // Add zoom controls
        const nav = new mapboxgl.NavigationControl();
        map.addControl(nav, 'top-left');

        //** CARTO VL functionality begins here **//

        // Define user
        carto.setDefaultAuth({
            username: 'cartovl',
            apiKey: 'default_public'
        });

        // Define source
        const source = new carto.source.Dataset('vancouver_trees');

        // Define Viz object and custom style
        const viz = new carto.Viz(`
            @category: ramp($common_name,prism)

            width: ramp(zoomRange([10,15]),[1,scaled($diameter/2,15)])
            color: ramp(zoomRange([12,13]),[green,opacity(@category,0.7)])
            strokeColor: ramp(zoomRange([12,13]),[black,@category])
            strokeWidth: ramp(zoomRange([13,14,16]),[0,0.5,1])
            filter: ramp(zoomrange([12,13,14,15,16]),
                        [$diameter>30,
                        $diameter>15,
                        $diameter>10,
                        $diameter>5,
                        true]
                    )
        `);

        // Define map layer
        const layer = new carto.Layer('layer', source, viz);

        // Add map layer
        layer.addTo(map,'watername_ocean');
    </script>
</body>

</html>
```
