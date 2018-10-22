## Interactivity and events
In this guide you will learn how to deal with user interactions within your visualization. After going through it, you will be able to manage some interesting events (e.g. waiting for a layer to load or clicking on a feature) to give your users more dynamic and useful visualizations. You will also learn how to build very common add-ons such as *pop-ups*.

At the end of the guide you will have built a visualization like this one. Move your mouse over the cities and click on them to display a pop-up:
<div class="example-map">
    <iframe
        id="guides-interactivity-step-final"
        src="/developers/carto-vl/examples/maps/guides/interactivity/step-4.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

In order to start, grab the source from a working template like this [basemap](/developers/carto-vl/examples/maps/guides/getting-started/step-1.html). Copy its source code into a new file called `interactivity.html` and test it is working fine before going on.

Add a navigation control to the map, with:
```js
// Add zoom controls
const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');
```

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
    console.log(`Center: [${longitude}, ${latitude}] - Zoom: ${zoom} - Bearing: ${bearing} degrees`);
};
map.on('move', displayCenter);
```

**Note:**
Check the console after loading your file in the browser, to see the first message: 'Map has loaded'. Then, interact with the map control and see the updated values for center & zoom. You can check Mapbox [Map reference](https://www.mapbox.com/mapbox-gl-js/api/#map) for more information on map events.

The result should look like this [map](/developers/carto-vl/examples/maps/guides/interactivity/step-1.html). Open it, change the extent and read the messages in the console (enable browser _Developer tools_):


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

**Note:**
This previous event could be useful for example to display some kind of loading animation over your map and then hiding it after the layer has loaded (see for example this [visualization](/developers/carto-vl/examples/maps/advanced/landing-page/hurricane-harvey.html)). Notice how the name of the event is `loaded`, not `load`.

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

You should now open the [map](/developers/carto-vl/examples/maps/guides/interactivity/step-2.html) and explore the _console_ to check the current events.


### Using dynamic variables
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

Open the map at [this step](/developers/carto-vl/examples/maps/guides/interactivity/step-3.html) and explore its console. Check how the amount of cities in the log messages reduces as you zoom in.


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

As the variables depend on properties, you can't just access them by using something like `viz.variables.name.value` on `layer:updated`. That will throw an error saying: _property needs to be evaluated in a 'feature'_. You need to use [carto.Interactivity](/developers/carto-vl/reference/#cartointeractivity).


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
[blendTo](/developers/carto-vl/reference/#expressionblendto) is an expression that allows a smooth transition between two values. In this case, the transition makes the original color turn to red and also increases the size of the symbols.

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

You can explore the final step [here](/developers/carto-vl/examples/maps/guides/interactivity/step-4.html)


Here it is the full example:
```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">

    <script src="https://libs.cartocdn.com/carto-vl/%VERSION%/carto-vl.js"></script>
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
            console.log(`Center: [${longitude}, ${latitude}] - Zoom: ${zoom} - Bearing: ${bearing} degrees`);
        };
        map.on('move', displayCenter);


        //** CARTO VL functionality begins here **//


        // LAYER EVENTS & VARIABLES
        // Add layer as usual
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
