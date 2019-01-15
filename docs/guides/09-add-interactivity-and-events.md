## Add interactivity and events
In this guide you will learn how to add user interactions to your CARTO VL visualization. By the end of this guide, you will have a better understanding of events (e.g. waiting for a layer to load or clicking on a feature) and how they can be used to make your visualization more dynamic and also provide a richer experience for the end-user (e.g. changing the color of features on hover or click, thanks to several [interactivity](https://carto.com/help/glossary/#interactivity) features). You will also learn how to add common add-ons like *pop-ups* with additional information about the data being clicked on or hovered.

By the end of the guide you will have built a visualization like this one where the color of features change as you move the mouse over them and display pop-up information when you click on them:
<div class="example-map">
    <iframe
        id="guides-interactivity-step-final"
        src="/developers/carto-vl/examples/maps/guides/add-interactivity/step-4.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

### Getting started
To start, grab the source from a working template like this [basemap](/developers/carto-vl/examples/maps/guides/getting-started/step-1.html) one and copy the source code into a new file named `interactivity.html` and test it by opening the file in a browser before moving forward.

### Map events
Let's start with _map events_. These are events you can listen to from the **map** itself. For example, if you want to listen to an event for when a map loads or even display the current map's center coordinates, you can use a set of events provided by **Mapbox GL JS Map**, such as [load](https://www.mapbox.com/mapbox-gl-js/api#map.event:load) and [move](https://www.mapbox.com/mapbox-gl-js/api#map.event:move) respectively, and attach callback functions to react to them.

Try these map events out by adding a pair of listeners to your code, just after the code for the zoom controls:
```js
// Wait for the map to load for the first time
map.on('load', () => {
    console.log('Map has loaded!');
});

// Listen for every move event by the user
const displayCenter = () => {
    const center = map.getCenter();
    const longitude = center.lng.toFixed(6);
    const latitude = center.lat.toFixed(6);
    const bearing = map.getBearing().toFixed(0);
    const zoom = map.getZoom().toFixed(2);
    console.log(`Center: [${longitude}, ${latitude}] - Zoom: ${zoom} - Bearing: ${bearing} degrees`);
};
map.on('move', displayCenter);
```

To see the "reactions" (callback functions) to each map event above, open your file in a browser and then open the console through the browser's developer tools. Once the map loads you will see the first message: 'Map has loaded!'. Next, with the console still open, use the zoom controls to interact with the map and watch as the values for `Center:` and `Zoom:` update.

For more information on Mapbox GL JS map events see their [Map reference](https://www.mapbox.com/mapbox-gl-js/api/#map).

### Layer events
In the previous section you saw how to add _map events_ once you have a basemap added. In this section, we will look at how to listen to _layer events_ with CARTO VL.

All [carto.Layer](/developers/carto-vl/reference/#cartolayer) objects have two events you can listen to: _`loaded`_ and _`updated`_.

#### Loaded event

The use of the `loaded` event is pretty common due to the fact that in most cases, you will load data from an external server and depending on where it is coming from, that could take time.

Add this to your code to create a CARTO VL layer of populated places and add it to your map:
```js
carto.setDefaultAuth({ username: 'cartovl', apiKey: 'default_public' });
const source = new carto.source.Dataset('populated_places');
const viz = new carto.Viz();
const layer = new carto.Layer('Cities', source, viz);
layer.addTo(map);
```

Next add a `loaded` listener for that layer:
```js
layer.on('loaded', () => {
    console.log('Cities layer has loaded!');
});
```

Load the file in your browser and open the console. This time, you will see two messages. First, `Map has loaded!` from the _map event_ and then, `Cities layer has loaded!` from the _layer event_.

If you were adding more than one layer to your map, you could use a single function to handle all of them. For these cases, **on** and **off** methods are available at the `carto` namespace. For example: `carto.on('loaded', [layer1, layer2], () => { console.log('All layers have loaded'); })` would show the message `All layers have loaded` once layer1 and layer2 draw on the map.

There are multiple ways you can build on the `loaded` event. For example, you could use it to add a status bar on your map for when a layer is loading and then hide it once the layer loads. You can see a similar example in this [visualization](/developers/carto-vl/examples/maps/advanced/landing-page/hurricane-harvey.html)).

**Note:**
It is important to note that the name of this event is **`loaded`**, not `load`.

#### Updated event
The `updated` event, is useful for cases when a layer gets updated. It will be triggered when the map is panned or zoomed, when the source is changed, when the viz changes or when the viz is animated.

If you check your work now, it should look like this:
<div class="example-map">
    <iframe
        id="guides-interactivity-step-2"
        src="/developers/carto-vl/examples/maps/guides/add-interactivity/step-2.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

You should now open the [map](/developers/carto-vl/examples/maps/guides/add-interactivity/step-2.html) and explore the _console_ to check the current events.

### Using variables
*Variables* are a way to store and reuse expressions, and that can definitively help you when adding interactions to your visualization, so let's practice a bit with them.

#### Variables without properties
First, you are going to add a variable whose value depends solely on the current map extent. Replace your current `const viz = new carto.Viz();` with this code that grabs the current number of displayed features using the *String API*:
```js
const viz = new carto.Viz(`
    @currentFeatures: viewportCount()
`);
```

And then add this code to handle the updates after you change the map's extent:
```js
const displayNumberOfCities = () => {
    const numberOfFeatures = viz.variables.currentFeatures.value.length;
    console.log(`Now you can see ${numberOfFeatures} cities`);
};
layer.on('updated', displayNumberOfCities);
```

**Note:**
Notice how the variable can be accessed directly from the `carto.Viz` object, inside its `variables` array, without the `@` symbol. Its content is accessible using `.value`, and this is possible because the expression has no `properties` related to the features themselves.

`layer:updated` will notify you of every change that may result in a change of the variables value.

If you want to reduce the number of current `console.log` entries, to better see the new one, you can remove the previous handler on `map:move` with:
```js
map.off('move', displayCenter);
```

You have already advanced a lot in this guide. Now take a small rest and check your work with this:
<div class="example-map">
    <iframe
        id="guides-interactivity-step-3"
        src="/developers/carto-vl/examples/maps/guides/add-interactivity/step-3.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

Open the map at [this step](/developers/carto-vl/examples/maps/guides/add-interactivity/step-3.html) and explore its console. Check how the amount of cities in the log messages reduces as you zoom in.


#### Data-driven variables
If the data you are interested in for your interaction is a feature `property`, such as the _name_ of the city or its _population_, then you can also use some variables to store them. Those are called _data-driven variables_, because their values change as you interact with each of the features (in our example, with each city).

To test them you should edit again your `viz` as follows:
```js
const viz = new carto.Viz(`
    @currentFeatures: viewportCount()
    @name: $name
    @popK: $pop_max / 1000.0
`);
```

**Note:**
Both properties, `$name` and `$pop_max` are columns in the original dataset.

As the variables depend on properties, you can't just access them by using something like `viz.variables.name.value`. That will throw an error saying: _property needs to be evaluated in a 'feature'_. You'll need to refer to a specific set of features: the ones clicked or hovered by using [carto.Interactivity](/developers/carto-vl/reference/#cartointeractivity) or all the ones that are on the viewport by using [viewportFeatures](/developers/carto-vl/reference/#cartoexpressionsviewportfeatures).


### Feature events
All feature interactions are ruled by the `carto.Interactivity`, so let's create an object of this type, associating it with the current layer.

Add this line to your code:
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

**Note:**
Notice how `carto.Interactivity` provides you with a dynamic change on the mouse pointer when you hover on a feature, and how it handles a collection (because you can click on several features at the same time if they are near enough).

The **carto.Interactivity** can handle different events:
- `featureClick`: Fired when the user clicks on features.
- `featureClickOut`: Fired when the user clicks outside a feature that was clicked in the last featureClick event.
- `featureHover`: Fired when the user moves the cursor over a feature.
- `featureEnter`: Fired the first time the user moves the cursor inside a feature.
- `featureLeave`: Fired the first time the user moves the cursor outside a feature.

In every callback a single parameter of type [featureEvent](/developers/carto-vl/reference/#featureevent) will be received. This object will have the `position` and `coordinates` where the
event happened (we didn't use that so far) and the list of [Features](/developers/carto-vl/reference/#feature) that have been interacted.


### Adding pop-ups
A very common case when creating dynamic visualizations is to display pop-ups, little emerging windows with information on the features.

You can build the pop-up yourself if you want to, but using `Mapbox GL` allows you to reuse [mapboxgl.Popup](https://www.mapbox.com/mapbox-gl-js/api/#popup) in this case.

So let's adapt a bit the previous `featureClick` handler. You're going to add some code inside the current handler:
```js
interactivity.on('featureClick', featureEvent => {
    // ...existing code...
    // Add more code <HERE>
});
```

Just grab the first feature in the interaction, if exists, with this code:
```js
const feature = featureEvent.features[0];
if (!feature) {
    return;
}
```

And then you can create the pop-up with this:
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
For simplicity, we have just created a pop-up linked to the first feature, but you're free to choose the contents (maybe even a paginated pop-up with several cities and some photos?).


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

**Note:**
[blendTo](/developers/carto-vl/reference/#expressionblendto) is an expression that allows a smooth transition between two values. In this case, the transition makes the original color turn to green and also increases the size of the symbols.

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
        src="/developers/carto-vl/examples/maps/guides/add-interactivity/step-4.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

You can explore the final step [here](/developers/carto-vl/examples/maps/guides/add-interactivity/step-4.html)


Here it is the full example:
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
    <div id="map"></div>
    <script>
        const map = new mapboxgl.Map({
            container: 'map',
            style: carto.basemaps.voyager,
            center: [0, 30],
            zoom: 2
        });

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
            console.log(`Center: [${longitude}, ${latitude}] - Zoom: ${zoom} - Bearing: ${bearing} degrees`);
        };
        map.on('move', displayCenter);

        // LAYER EVENTS & VARIABLES
        carto.setDefaultAuth({ username: 'cartovl', apiKey: 'default_public' });
        const source = new carto.source.Dataset('populated_places');

        // Viz using a dynamic variable
        const viz = new carto.Viz(`
            @currentFeatures: viewportCount()
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
            const numberOfFeatures = viz.variables.currentFeatures.value;
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
