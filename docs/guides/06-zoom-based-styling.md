## Zoom-based Styling

An inherent feature of any map viewed on the web is the ability to zoom in and out. Each time you zoom in or out of a map, you are viewing a different _zoom level_. At each zoom level or range of zoom levels, there are important design considerations for how data are visualized and/or what information is displayed. 

With any map, the decisions that you as the map designer make are critical to the interpretability of your map by the end user. The zoom-based styling decisions that you make should be determined by the story you want to tell, the data that you are mapping, and the zoom levels at which your map will be viewed. 

We most often hear about zoom-based styling in the context of basemaps. As an example, if we look at one of CARTO’s basemaps, Voyager, across different zoom levels, we see that as the zoom level gets larger (zooming into the map), more features and labels are added. As these features and labels appear, their styling is adjusted to support the current view. 

For example, major highways don’t display until zoom 5 and when they do, the appearance transitions from a single, small width line at low zoom levels to cased lines at larger zoom levels.

[MULTI-SCALE shot of Voyager]

### Zoom-based styling with VL

In the past, zoom-based styling has been overly complex creating a barrier of entry for many. It is no wonder that it was “easier” to put too much information on a map and/or only design a map for one zoom level.  

That’s not the case with CARTO VL.

In this guide, we will demonstrate how this complexity has been greatly reduced and introduce _our_ concept of zoom-based styling. By the end of this guide, you will learn how to take advantage of these features and start making a whole new kind of multi-scale thematic map!

### Overview

Using a [street trees](https://data.vancouver.ca/datacatalogue/streetTrees.htm) dataset from the City of Vancouver, first, we will explore the following zoom-based functionalities: 

- `scaled`
  - How to keep symbol sizes consistent through zoom level
- [`zoomRange()`](https://carto.com/developers/carto-vl/reference/#cartoexpressionszoomrange)
  - How to introduce detail through zoom across multiple visualization properties
- [`zoom`](https://carto.com/developers/carto-vl/reference/#cartoexpressionszoom)
  - How to filter the amount or type of data that is visible at each zoom

After we explore each one independently, we will bring them together to create a map like this one (go ahead, zoom in and out!):
<div class="example-map">
    <iframe
        id="guides-zoom-based-styling-step-final"
        src="/developers/carto-vl/examples/guides/zoom-based-styling/final-map.html"
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
    <!-- Include CARTO VL JS -->
    <script src="../../../dist/carto-vl.js"></script>
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

Take a few minutes to zoom in and out of the map above. What you will notice is that the style modifications we made function at our opening zoom of 11 and smaller, but begin to break down as we zoom in on the map.

That's because styling that works well at _one_ zoom level doesn't always work well at _all_ zoom levels. 

Let's say we are satisfied with how a `1` point symbol size looks at our opening zoom of `11`, we can use those two pieces of information as our anchor inside of `scaled`. This will keep symbol sizes constant (in real space) through zoom. 

Let's give it a try by adjusting the `width` property:

```js
width: scaled(1,11)
```

Now as we zoom in and out of the map, you'll notice that the `1` point symbol size that we defined, scales:

<div class="example-map">
    <iframe
        id="guides-zoom-based-styling-step-3"
        src="/developers/carto-vl/examples/guides/zoom-based-styling/step-3.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

If you aren't satisfied with the result, try adjusting the anchor scale and/or point width. For example, adjust the `width` style to `scaled(1,15)`. You can also use this functionality with `strokeWidth`.

### Define a range of symbol sizes

As demonstrated above, the `scaled` option is great to keep symbol sizes consistent through zoom. But there are other times where you will want finer control at every zoom level and/or at a range of zoom levels.

Next, let's take a look at how we can use the `zoomRange` expression inside of a `ramp`.

In the previous step, we determined that a width of `1` worked well at our opening zoom of `11` but noticed in previous steps, as we zoom in, the size of `1` doesn't hold up well.

We can use the results of this visual examination to set different widths by zoom:  

```js
width: ramp(zoomrange([12,18]),[1,20])
```

This sets the width of our symbols to be `1` at zoom levels less than `12` and `20` at zoom levels greater than `18`. All other sizes (for zooms `12` through `18`) will be interpolated between the anchor sizes of `1` and `20`. You can add additional breakpoints to fine-tune your map even further.

<div class="example-map">
    <iframe
        id="guides-zoom-based-styling-step-4"
        src="/developers/carto-vl/examples/guides/zoom-based-styling/step-4.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

We can use the same logic to modify our `strokeWidth` by zoom:

```js
strokeWidth: ramp(zoomrange([12,18]),[0.5,2])
```

as well as the `color` and `strokeColor`:

```js
color: ramp(zoomrange([12,18]),[white,green])
strokeColor: ramp(zoomrange([12,18]),[green,white])
```

<div class="example-map">
    <iframe
        id="guides-zoom-based-styling-step-5"
        src="/developers/carto-vl/examples/guides/zoom-based-styling/step-5.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

While the examples above only set styles for two zooms, you can add more zoom levels and style conditions. If you want to try it out, you can add additional stops to any of the styles above.

### Set feature visibility by zoom

Up until now, we have seen how to modify the _appearance_ of features based on zoom. Next, we'll explore ways to control the _visibility_ of features to introduce more detail as we zoom in to the map, and remove detail as we zoom out. 

We will look at two different ways this can be done. First, with `zoomrange` and then with `zoom`.

As we saw in the previous step, using `zoomrange`, inside of a `ramp` allows us to define particular styles at a variety of zoom levels. We can use this functionality inside of a filter as well to set criteria for when features appear and disappear through zoom.

In the Vancouver trees dataset, there is an attribute that records the diameter of each tree. We will use that attribute to decrease the number of points that are visible at our opening zoom by displaying only the trees that pass our `filter` criteria.

Let's explore this further with [`zoom`](https://carto.com/developers/carto-vl/reference/#cartoexpressionszoom)using the [`filter`](https://carto.com/developers/carto-vl/reference/#cartoexpressions) property.



Using the map we made in the previous section, add the following line to the visualization:

```js
filter: zoom()>12 or $diameter>20
```

With this filter, we are saying that at zoom levels less than `12`, only display trees that have a diameter greater than `20`. Then at zooms greater than `12`, display all points. 

In the resulting map, we can see that the number of points at our opening zoom is reduced and if we zoom in another level, all of the trees draw.


<div class="example-map">
    <iframe
        id="guides-zoom-based-styling-step-6"
        src="/developers/carto-vl/examples/guides/zoom-based-styling/step-6.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

### Bringing it together

As described at the beginning of the guide, with basemap design, features are introduced as they are relevant and designed according to the current zoom. The same thinking can be applied to thematic data by using zoom-based filters in conjunction with zoom-based styling.

