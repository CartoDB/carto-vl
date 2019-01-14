## Zoom-based styles
An inherent feature of any map viewed on the web is the ability to zoom in and out. Each time you zoom in or out of a map, you are viewing a different [_zoom level_](https://carto.com/help/glossary/#zoomlevels). At each zoom level or range of zoom levels, there are important design considerations for how data are visualized and/or what information is displayed.

With any map, the decisions that you as the map designer make are critical to the interpretability of your map by the end user. The zoom-based styling decisions that you make should be determined by the story you want to tell, the data that you are mapping, and the zoom levels at which your map will be viewed.

We most often hear about zoom-based styling in the context of [basemaps](https://carto.com/help/glossary/#basemap). As an example, if we look at one of CARTO’s basemaps, Voyager, across different zoom levels, we see that as the zoom level gets larger (zooming into the map), more features and labels are added. As these features and labels appear, their styling is adjusted to support the current view.

For example, major highways don’t display until zoom 5 and when they do, the appearance transitions from a single, small width line at low zoom levels, to cased lines at larger zoom levels.


![Multi-scale GIF of Voyager](../../img/guides/zoom-based-styling/multi-scale-voyager.gif)


**Note:**
The CARTO VL renderer provides a native/built-in way to do zoom-based styling without "popping" (by interpolating), which results in smooth transitions.

### Overview
In the past, zoom-based styling has been overly complex creating a barrier of entry for many. It is no wonder that it was “easier” to put too much information on a map and/or only design a map for one zoom level.

That’s not the case with CARTO VL.

In this guide, we will demonstrate how this complexity has been greatly reduced and introduce _our_ concept of zoom-based styling. By the end of this guide, you will learn how to take advantage of these features and start making a whole new kind of multi-scale thematic map!

Using a [street trees](https://data.vancouver.ca/datacatalogue/streetTrees.htm) dataset from the City of Vancouver, first, you will explore the following zoom-based functionalities:

- [`scaled`](/developers/carto-vl/reference/#cartoexpressionsscaled): how to keep symbol sizes constant in real-life meters through zoom levels.
- [`zoomRange`](/developers/carto-vl/reference/#cartoexpressionszoomrange): how to introduce detail through zoom across multiple visualization properties.
- [`zoom`](/developers/carto-vl/reference/#cartoexpressionszoom): how to filter the amount or type of data that is visible at each zoom.

After you explore each one independently, you will bring them together to create a map like this one (go ahead, zoom in and out!):
<div class="example-map">
    <iframe
        id="guides-zoom-based-style-step-8"
        src="/developers/carto-vl/examples/maps/guides/zoom-based-styles/step-8.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
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
    <script src="../../../dist/carto-vl.js"></script>
    <script src="https://api.tiles.mapbox.com/mapbox-gl-js/v0.52.0/mapbox-gl.js"></script>
    <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.52.0/mapbox-gl.css" rel="stylesheet" />
    <link rel="stylesheet" type="text/css" href="../../style.css">
    <style>
        #js-zoom {
            position: absolute;
            bottom: 0;
            padding: 0 5px;
            background-color: rgba(255, 255, 255, 0.5);
            margin: 0;
            color: rgba(0, 0, 0, 0.75);
            font-size: 16px;
        }
    </style>
</head>

<body>
    <div id="map"></div>
    <div id="js-zoom"></div>
    <script>
        const map = new mapboxgl.Map({
            container: 'map',
            style: carto.basemaps.darkmatter,
            center: [-123.098599, 49.240685],
            zoom: 11
        });
        const nav = new mapboxgl.NavigationControl();
        map.addControl(nav, 'top-left');

        function updateZoom() {
            const zoom = map.getZoom().toFixed(2);
            document.getElementById('js-zoom').innerText = `Zoom: ${zoom}`;
        }
        map.on('load', updateZoom);
        map.on('move', updateZoom);

        carto.setDefaultAuth({
            username: 'cartovl',
            apiKey: 'default_public'
        });

        const source = new carto.source.Dataset('vancouver_trees');

        const viz = new carto.Viz(`
            color: white
            strokeColor: green
        `);
        const layer = new carto.Layer('layer', source, viz);
        layer.addTo(map, 'watername_ocean');
    </script>
</body>

</html>
```

**Note:**
Notice how there is a little zoom level indicator, in the bottom-left hand corner. There is an `updateZoom` function in the JavaScript code that updates its content once the maps loads and every time it is moved.

### Adjust symbol size
As you can see on the map, there are a lot of trees in Vancouver!

<div class="example-map">
    <iframe
        id="guides-zoom-based-style-step-1"
        src="/developers/carto-vl/examples/maps/guides/zoom-based-styles/step-1.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>

To better visualize the high density of information, override the default point `width` and set it to `1` and set the `strokeWidth` to `0.5`:

```js
const viz = new carto.Viz(`
    color: white
    width: 1
    strokeColor: green
    strokeWidth: 0.5
`);
```

With these adjustments, the distribution of trees around the city is clearer:

<div class="example-map">
    <iframe
        id="guides-zoom-based-style-step-2"
        src="/developers/carto-vl/examples/maps/guides/zoom-based-styles/step-2.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>


### Scale symbol size
Take a few seconds to zoom in and out of the map above. What you will notice is that the style modifications made function at the opening zoom of `11` and smaller, but begin to break down when zooming in.

That's because styling that works well at _one_ zoom level doesn't always work well at _all_ zoom levels.

Let's say you are satisfied with how a `1` point symbol size looks at the opening zoom of `11`, you can use those two pieces of information as the anchor inside of `scaled`. This will keep symbol sizes constant (in real space) through zoom.

Give it a try by adding this information to the `width` property:

```CARTO_VL_Viz
width: scaled(1,11)
```

In the resulting map, as you zoom in and out, you'll notice that the `1` point symbol size, scales based on the current zoom level:

<div class="example-map">
    <iframe
        id="guides-zoom-based-style-step-3"
        src="/developers/carto-vl/examples/maps/guides/zoom-based-styles/step-3.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>

**Note:**
If you aren't satisfied with the previous result, try adjusting the anchor scale and/or point width. For example, adjust the `width` style to `scaled(1,15)`. You can also use this functionality with `strokeWidth` to scale the outline of the points.


### Define a range of symbol sizes
As demonstrated above, the `scaled` option is great to keep symbol sizes consistent through zoom. There are other times where you will want finer control at every zoom level and/or at a range of zoom levels.

Next, you will take a look at how to use the `zoomRange` expression inside of a `ramp` to accomplish that.

In the previous step, you saw that a width of `1` worked well at the opening zoom of `11` but noticed in previous steps, as you zoom in, the size of `1` doesn't hold up well.

The results of this visual examination can be used to set different widths by zoom:

```CARTO_VL_Viz
width: ramp(zoomrange([12,18]),[1,20])
```

This sets the width of symbols to `1` at zoom levels less than or equal to `12` and `20` at zoom levels greater than or equal to `18`. All other sizes (between zooms `12` and `18`) are interpolated between the anchor sizes of `1` and `20`. You can add additional breakpoints to fine-tune your map even further.

<div class="example-map">
    <iframe
        id="guides-zoom-based-style-step-4"
        src="/developers/carto-vl/examples/maps/guides/zoom-based-styles/step-4.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>


You can use the same logic for `strokeWidth`:

```CARTO_VL_Viz
strokeWidth: ramp(zoomrange([12,18]),[0.5,2])
```

As described above for any width property, symbol sizes are interpolated between the defined zoom ranges inside of the `ramp`. This is the same behavior for color.

To demonstrate, add the style for point color and stroke color below to your map:

```CARTO_VL_Viz
color: ramp(zoomrange([12,18]),[white,green])
strokeColor: ramp(zoomrange([12,18]),[green,white])
```
As you zoom in on the map, look closely at the point and stroke colors.

At zooms less than `12` the point color is `white` and the stroke color is `green`. At zooms greater than `18` we are flipping the fill and stroke colors.  You will know that you are at zoom `18` when the points are green with a white outline. As you zoom in, you will notice that there is a transition in color happening. This is where the interpolation is taking place.

<div class="example-map">
    <iframe
        id="guides-zoom-based-style-step-5"
        src="/developers/carto-vl/examples/maps/guides/zoom-based-styles/step-5.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>

While the examples above only set styles for two zooms, you can add more zoom levels and style conditions.

Give it a try! Add in some additional stops to any of the styles above to see what the possibilities are.


### Set feature visibility by zoom
Up until now, you have looked at ways to modify the _appearance_ of features based on zoom. Next, you'll explore ways to control the _visibility_ of features to introduce more detail as you zoom in on the map, and remove detail as you zoom out.

There are two ways this can be done: using `zoomrange` or using `zoom`.

As you learned in the previous step, using `zoomrange`, inside of a `ramp` allows you to define particular styles at a variety of zoom levels. You can use this functionality inside of a `filter` as well to set criteria for when features appear and disappear through zoom.

To demonstrate, we will use an attribute, `diameter` in the Vancouver trees dataset to control the visibility of trees, by zoom, based on this measurement.

To better visualize the points appearing through zoom, first classify the data using `globalQuantiles` with `7` class breaks, and color each class with the CARTOColor scheme `sunset`:

```CARTO_VL_Viz
color: ramp(globalQuantiles($diameter,7),sunset)
width: ramp(zoomrange([12,18]),[1,20])
strokeWidth: 0
```
Next, add a `filter` and set the visible `diameter` criteria with `zoomrange` to gradually introduce larger and larger trees until zoom `16` and greater, where all trees are displayed (`true`):

```CARTO_VL_Viz
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
        id="guides-zoom-based-style-step-6"
        src="/developers/carto-vl/examples/maps/guides/zoom-based-styles/step-6.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>


Next, explore this concept further using [`zoom`](/developers/carto-vl/reference/#cartoexpressionszoom) with the [`filter`](/developers/carto-vl/reference/#cartoexpressions) property.

Using the same map from above, replace the `filter` styling with:

```CARTO_VL_Viz
filter: zoom()>15 or $diameter>30
```

With this filter, all points will draw when both criteria are met. This means that at zoom levels less than `15`, only trees that have a diameter of greater than `30` will draw. Once we hit zooms `15` and larger, all points draw.

<div class="example-map">
    <iframe
        id="guides-zoom-based-style-step-7"
        src="/developers/carto-vl/examples/maps/guides/zoom-based-styles/step-7.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>

**Note:**
Which method you use depends on whether you want to introduce detail incrementally (`zoomrange`) or whether there is a more general (`zoom`) filter that can be applied through zoom.


### Bringing it together
As described at the beginning of the guide, with basemap design, features are introduced as they are relevant and designed according to the zoom at which they are being viewed. In this guide you've explored a variety of ways to do the same for thematic data and CARTO VL.

The final example in this guide demonstrates how to combine zoom-based filters and zoom-based styling to multiple visualization properties to introduce thematic characteristics of a dataset through zoom.

Take a look at the map, zoom in and out to see the changes in the styling and visibility of features:

<div class="example-map">
    <iframe
        id="guides-zoom-based-style-step-8"
        src="/developers/carto-vl/examples/maps/guides/zoom-based-styles/step-8.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>
You can explore the final step [here](/developers/carto-vl/examples/maps/guides/zoom-based-styles/step-8.html)


Pretty neat, right?!

Using zoom-based filters to introduce detail, the map opens with all visible trees colored green and sized to suit the density of information and view. As the zoom level increases, the color of trees transitions from green to a categorical coloring based on its `common_name`. At the next set of zoom levels, another attribute (`diameter`) is introduced by changing the sizing of features and setting an anchor for that sizing using `scaled`. Other properties like `strokeColor` and `strokeWidth` are also adjusted through zoom to compliment the multi-scale styling of the trees.

If you would like to take a closer look, the full code for the example is here:

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <script src='https://libs.cartocdn.com/carto-vl/%VERSION%/carto-vl.min.js'></script>

    <script src="https://api.tiles.mapbox.com/mapbox-gl-js/v0.52.0/mapbox-gl.js"></script>
    <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.52.0/mapbox-gl.css" rel="stylesheet" />

    <link rel="stylesheet" type="text/css" href="../../style.css">
    <style>
        #js-zoom {
            position: absolute;
            bottom: 0;
            padding: 0 5px;
            background-color: rgba(255, 255, 255, 0.5);
            margin: 0;
            color: rgba(0, 0, 0, 0.75);
            font-size: 16px;
        }
    </style>
</head>

<body>
    <div id="map"></div>
    <div id="js-zoom"></div>

    <script>
        const map = new mapboxgl.Map({
            container: 'map',
            style: carto.basemaps.darkmatter,
            center: [-123.098599, 49.240685],
            zoom: 11
        });
        const nav = new mapboxgl.NavigationControl();
        map.addControl(nav, 'top-left');

        function updateZoom() {
            const zoom = map.getZoom().toFixed(2);
            document.getElementById('js-zoom').innerText = `Zoom: ${zoom}`;
        }
        map.on('load', updateZoom);
        map.on('move', updateZoom);

        carto.setDefaultAuth({
            username: 'cartovl',
            apiKey: 'default_public'
        });

        const source = new carto.source.Dataset('vancouver_trees');

        // Define zoom-based style
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
        const layer = new carto.Layer('layer', source, viz);
        layer.addTo(map,'watername_ocean');
    </script>
</body>

</html>
```
