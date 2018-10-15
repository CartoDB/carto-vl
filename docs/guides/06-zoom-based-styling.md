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
        id="guides-zoom-based-styling-step-4"
        src="/developers/carto-vl/examples/guides/zoom-based-styling/step-4.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

### Set visibility filter by zoom

With the previous two functionalities, we saw how we can modify the _appearance_ of features based on zoom. Next, we'll explore how we can control the _visibility_ of features to introduce more detail as we zoom in. 

As described at the beginning of the guide, with basemap design, features are introduced as they are relevant and designed according to the visible zoom. The same thinking can be applied to thematic data by using zoom-based filters in conjunction with zoom-based styling.

Let's explore this further by using [`zoom`](https://carto.com/developers/carto-vl/reference/#cartoexpressionszoom)with inside of a [`filter`]() element.

Good to think about w/ mulit-scale design. Do we always need to show all information at all zoom levels, or is there a logical way that we can introduce detail through zoom.






### Map events
It all begins with the map and sometimes you are interested in listening to some relevant events from to the **map** itself. For example you want to wait for it to load or maybe display the current map's center coordinates. In those cases, you can use a set of events already provided by the **Mapbox GL JS Map**, such as [load](https://www.mapbox.com/mapbox-gl-js/api#map.event:load) and [move](https://www.mapbox.com/mapbox-gl-js/api#map.event:move) respectively, and attach callback functions to react on them.

Add this pair of listeners to your code to test map events, just after the map initialization:
```js
// Wait for the map to render for the first time
map.on('load', () => {
    console.log('Map has loaded!');
});
// Listen to every move event caused by the user
const displayCenter = () => {
    const center = map.getCenter();
    const longitude = center.lng.toFixed(6);
    const latitude = center.lat.toFixed(6);
    const bearing = map.getBearing().toFixed(0);
    const zoom = map.getZoom().toFixed(2);
    console.log(`Center: [${longitude}, ${latitude}] - Zoom: ${zoom} - Bearing: ${bearing}º`);
};
map.on('move', displayCenter);
```
> Check the console after loading your file in the browser, to see the first message: 'Map has loaded'. Then, interact with the map control and see the updated values for center & zoom. You can check Mapbox [Map reference](https://www.mapbox.com/mapbox-gl-js/api/#map) for more information on map events.

The result should look like this:
<div class="example-map">
    <iframe
        id="guides-interactivity-step-1"
        src="/developers/carto-vl/examples/maps/guides/interactivity/step-1.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>


### Layer events
Once you have your basemap, you can start to work with your layers. And all [carto.Layer](/developers/carto-vl/reference/#cartolayer) objects have two events to listen to: `loaded` and `updated`.

The use of the `loaded` event is pretty common, due to the fact that in most cases you need to load the data from an external server and that can take some time.

Add this to your code to create a layer as usual, and add it to your map:
```js
carto.setDefaultAuth({ username: 'cartovl', apiKey: 'default_public' });
const source = new carto.source.Dataset('populated_places');
const viz = new carto.Viz();
const layer = new carto.Layer('Cities', source, viz);
layer.addTo(map);
```

Now add a `loaded` listener to the previous layer:
```js
layer.on('loaded', () => {
    console.log('Cities layer has been loaded!');
});
```
> This event could be useful for example to display some kind of loading animation over your map and then hiding it after the layer has loaded (see for example this [visualization](/developers/carto-vl/examples/maps/advanced/landing-page/hurricane-harvey.html)). Notice how the name of the event is `loaded`, not `load`.

If you were using several layers, you could also have a single function to handle them all. For this case, **on** and **off** are available at `carto` namespace, expecting a list of layers like in this code: `carto.on('loaded', [layer1, layer2], () => { console.log('All layers have loaded'); })`.

Regarding to the `updated` event, it can be useful for the cases where the layer's viz changes, for example when you are building an animation. See the [Playing with animations guide](/developers/carto-vl/guides/playing-with-animations).

If you check your work now, it should look like this:
<div class="example-map">
    <iframe
        id="guides-interactivity-step-2"
        src="/developers/carto-vl/examples/maps/guides/interactivity/step-2.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>


### Using dynamic variables
*Variables* are a way to store and reuse expressions, and that can definitively help you when adding interactions to your visualization, so let's practice a bit with them.

#### Variables without properties
First, you are going to add a variable whose value depends solely on the current map extent. Replace your current `const viz = new carto.Viz();`, with this code that grabs the current displayed features using the *String API*:
```js
const viz = new carto.Viz(`
    @currentFeatures: viewportFeatures()
`);
```

And finally, you should add this to handle the updates after you change the map's extent:
```js
const displayNumberOfCities = () => {
    const numberOfFeatures = viz.variables.currentFeatures.value.length;
    console.log(`Now you can see ${numberOfFeatures} cities`);
};
layer.on('updated', displayNumberOfCities);
```
> Notice how the variable can be accessed directly from the `carto.Viz` object, inside its `variables` array, without the `@` symbol. Its content is accessible using `.value`, and this is possible because the expression has no `properties` related to the features themselves.

You can imagine `layer:updated` event as a "kind of" `layer:viz-updated` event, notifying you whenever something relevant has changed in the viz attached to the layer.

If you want to reduce the number of current `console.log` entries, to better see the new one, you can remove the previous handler on `map:move` with:
```js
map.off('move', displayCenter);
```

You have already advanced a lot in this guide. Now take a small rest and check your work with this:
<div class="example-map">
    <iframe
        id="guides-interactivity-step-3"
        src="/developers/carto-vl/examples/maps/guides/interactivity/step-3.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

#### Data-driven variables
If the data you are interested in for your interaction is a feature `property`, such as the _name_ of the city or its _population_, then you can also use some variables to store them. Those are called _data-driven variables_, because their values change as you interact with each of the features (in our example, with each city).

To test them you should edit again your viz as follows:
```js
const viz = new carto.Viz(`
    @currentFeatures: viewportFeatures()
    @name: $name
    @popK: $pop_max / 1000.0
`);
```
> Both properties, $name and $pop_max are columns in the original dataset.

As the variables depend on properties, you can't just access them by using something like `viz.variables.name.value` on `layer:updated`. That will throw an error saying: _property needs to be evaluated in a 'feature'_. You need to use [carto.Interactivity](/developers/carto-vl/reference/#cartointeractivity).


### Feature events
All feature interactions are ruled by the `carto.Interactivity`, so let's create an object of this type, associating it with the current layer.

Add this line:
```js
const interactivity = new carto.Interactivity(layer);
```

Then use its `featureClick` event to react when you click on a city:
```js
interactivity.on('featureClick', featureEvent => {
    featureEvent.features.forEach((feature) => {
        const name = feature.variables.name.value;
        const popK = feature.variables.popK.value.toFixed(0);
        console.log(`You have clicked on ${name} with a population of ${popK}K`);
    });
});
```
> Notice how `carto.Interactivity` provides you with a dynamic change on the mouse pointer when you hover on a feature, and how it handles a collection, because you can click on several features at the same time if they are near enough.

The `carto.Interactivity` can handle different events:
- `featureClick`: Fired when the user clicks on features.
- `featureClickOut`: Fired when the user clicks outside a feature that was clicked in the last featureClick event.
- `featureHover`: Fired when the user moves the cursor over a feature.
- `featureEnter`: Fired the first time the user moves the cursor inside a feature.
- `featureLeave`: Fired the first time the user moves the cursor outside a feature.

In every callback a single parameter of type [featureEvent](/developers/carto-vl/reference/#featureevent) will be received. This object will have the `position` and `coordinates` where the
event happened (we didn't use that so far) and the list of [Features](/developers/carto-vl/reference/#feature) that have been interacted.


### Adding pop-ups
A very common case is to display pop-ups, little emerging windows with information on the features.

You can build the pop-up yourself if you want to, but using `Mapbox GL` allows you to easily reuse [mapboxgl.Popup](https://www.mapbox.com/mapbox-gl-js/api/#popup).

So let's adapt a bit the previous 'featureClick' handler. You're going to add some code inside the current handler:
```js
interactivity.on('featureClick', featureEvent => {
    // ...existing code...
    // Add more code HERE
});
```

First just grab the first feature in the interaction, if exists, with this:
```js
const feature = featureEvent.features[0];
if (!feature) {
    return;
}
```

And then you can create the pop-up with this code:
```js
const coords = featureEvent.coordinates;
const html = `
    <h1>${feature.variables.name.value}</h1>
    <p>Population: ${feature.variables.popK.value.toFixed(0)}K</p>
`;
new mapboxgl.Popup()
    .setLngLat([coords.lng, coords.lat])
    .setHTML(html)
    .addTo(map);
```
> For simplicity, we have created a pop-up linked to the first feature, but you're free to choose the contents (maybe even a paginated pop-up with several cities and some photos?).

At this point, your map looks like:
<div class="example-map">
    <iframe
        id="guides-interactivity-step-4"
        src="/developers/carto-vl/examples/maps/guides/interactivity/step-4.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>


### Interactive-based styling
Interactivity also can help you to define your styles dynamically.

For example, with the next code you'll learn something very useful and common: how to style your features when you interact with them, to give more emphasis to the selected ones.

First you have to set up a listener for the `featureEnter` in the current `Interactivity` object. This listener will change the color and size of the features included in the `features` array.
```js
interactivity.on('featureEnter', featureEvent => {
    featureEvent.features.forEach((feature) => {
        feature.color.blendTo('rgba(0, 255, 0, 0.8)', 100);
        feature.width.blendTo(20, 100);
    });
});
```
> [blendTo](/developers/carto-vl/reference/#expressionblendto) is an expression that allows a smooth transition between two values. In this case, the transition makes the original color turn to red and also increases the size of the symbols.

When the `featureLeave` event is fired you can tell your callback to `reset` the color and size for each feature:
```js
interactivity.on('featureLeave', featureEvent => {
    featureEvent.features.forEach((feature) => {
        feature.color.reset();
        feature.width.reset();
    });
});
```

### All together

Congrats! You've finished this guide. The final map should look like this:
<div class="example-map">
    <iframe
        id="guides-interactivity-step-final"
        src="/developers/carto-vl/examples/maps/guides/interactivity/step-4.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>


Here it is the full example:
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
            zoom: 2
        });

        // Add zoom controls
        const nav = new mapboxgl.NavigationControl();
        map.addControl(nav, 'top-left');


        // MAP EVENTS
        // Wait for the map to render for the first time
        map.on('load', () => {
            console.log('Map has loaded!');
        });

        // Listen to every move event caused by the user
        const displayCenter = () => {
            const center = map.getCenter();
            const longitude = center.lng.toFixed(6);
            const latitude = center.lat.toFixed(6);
            const bearing = map.getBearing().toFixed(0);
            const zoom = map.getZoom().toFixed(2);
            console.log(`Center: [${longitude}, ${latitude}] - Zoom: ${zoom} - Bearing: ${bearing}º`);
        };
        map.on('move', displayCenter);


        //** CARTO VL functionality begins here **//


        // LAYER EVENTS & VARIABLES
        // Add layer as usual
        carto.setDefaultAuth({ username: 'cartovl', apiKey: 'default_public' });
        const source = new carto.source.Dataset('populated_places');

        // Viz using a dynamic variable
        const viz = new carto.Viz(`
            @currentFeatures: viewportFeatures()
            @name: $name
            @popK: $pop_max / 1000.0
        `);
        const layer = new carto.Layer('Cities', source, viz);
        layer.addTo(map);

        // Add on 'loaded' event handler to layer
        layer.on('loaded', () => {
            console.log('Cities layer has been loaded!');
        });

        // Disable previous listener on map:move just for clarity
        map.off('move', displayCenter);

        // Add on 'updated' event handler to layer
        const displayNumberOfCities = () => {
            const numberOfFeatures = viz.variables.currentFeatures.value.length;
            console.log(`Now you can see ${numberOfFeatures} cities`);
        };
        layer.on('updated', displayNumberOfCities);


        // DATA-DRIVEN VARIABLES & carto.Interactivity
        const interactivity = new carto.Interactivity(layer);

        // Handle 'featureClick' to display city name and population
        interactivity.on('featureClick', featureEvent => {
            featureEvent.features.forEach((feature) => {
                const name = feature.variables.name.value;
                const popK = feature.variables.popK.value.toFixed(0);
                console.log(`You have clicked on ${name} with a population of ${popK}K`);
            });

            // Get the first feature
            const feature = featureEvent.features[0];
            if (!feature) {
                return;
            }

            // Add pop-up using mapboxgl
            const coords = featureEvent.coordinates;
            const html = `
                <h1>${feature.variables.name.value}</h1>
                <p>Population: ${feature.variables.popK.value.toFixed(0)}K</p>
            `;
            new mapboxgl.Popup()
                .setLngLat([coords.lng, coords.lat])
                .setHTML(html)
                .addTo(map);
        });

        // Disable previous listener on layer:updated just for clarity
        layer.off('updated', displayNumberOfCities);

        // Change style on 'featureEnter'
        interactivity.on('featureEnter', featureEvent => {
            featureEvent.features.forEach((feature) => {
                feature.color.blendTo('rgba(0, 255, 0, 0.8)', 100);
                feature.width.blendTo(20, 100);
            });
        });

        // Reset to previous style on 'featureLeave'
        interactivity.on('featureLeave', featureEvent => {
            featureEvent.features.forEach((feature) => {
                feature.color.reset();
                feature.width.reset();
            });
        });
    </script>
</body>

</html>
```
