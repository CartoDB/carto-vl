## Interactivity and events
In this guide you will learn how to deal with user interactions within your visualization. After going through it, you will be able to manage some interesting events (e.g. waiting for a layer to load or clicking on a feature) to give your users more dynamic and useful vizs. You will also learn how to build very common add-ons such as *pop-ups* and legends.

At the end of the guide you will have built a visualization like this:
<div class="example-map">
    <iframe
        id="interactivity-events-final-result"
        src="/developers/carto-vl/examples/maps/guides/interactivity/step-N.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

To start grab the source from a working template like this [basemap](/developers/carto-vl/examples/maps/guides/getting-started/step-1.html). Copy its source code into a new file called `interactivity.html` and test it is working fine before going on.

Add a navigation control to the map, with:
```js
// Add zoom controls
const nav = new mapboxgl.NavigationControl({
    showCompass: false
});
map.addControl(nav, 'top-left');
```

### Map events
It all begins with the map and sometimes you are interested in listening to some relevant events from to the **map** itself. For example you want to wait for it to load or maybe display the current map's center coordinates. In those cases, you can use a set of events already provided by the `Mapbox GL JS Map`, such as [load](https://www.mapbox.com/mapbox-gl-js/api#map.event:load) and [move](https://www.mapbox.com/mapbox-gl-js/api#map.event:move) respectively, and attach some callback functions to react on them.

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
    const zoom = map.getZoom();
    console.log(`Center: [${longitude}, ${latitude}] & Zoom: ${zoom}`);
};
map.on('move', displayCenter);
```
> Check the console after loading your file in the browser, to see the first message: 'Map has loaded'. Then, interact with the map control and see the updated values for center & zoom. You can check Mapbox [Map reference](https://www.mapbox.com/mapbox-gl-js/api/#map) for more information on map events.

The result should look like this:
<div class="example-map">
    <iframe
        id="guides-interactivity-events-step-1"
        src="/developers/carto-vl/examples/maps/guides/interactivity/step-1.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>


### Layer events
Once you have your basemap, you can start to work with your layers. And all `carto.Layer` objects have two events to listen to: `loaded` and `updated`.

The use of the `loaded` event is pretty common, due to in most cases you need to load the data from an external server and that can take some time.

Add this to your code to create a layer as usual, and add it to your map:
```js
carto.setDefaultAuth({ user: 'cartovl', apiKey: 'default_public' });
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
> This event could be useful for example to display some kind of loading animation over your map and then hiding it after the layer has loaded. Notice how the name of the event is `loaded`, not `load`.

If you were using several layers, you could also have a single function to handle them all. For this case, **on** & **off** are available at `carto` namespace, expecting a list of layers like this: `carto.on('loaded', [layer1, layer2], () => { console.log('All layers have loaded'); })`.

Regarding to the `updated` event, it can be useful for some other cases, where the layer's viz changes, for example when you are building an animation. See the [Playing with animations guide](/developers/carto-vl/guides/playing-with-animations).

If you check your work now, it should look like this:
<div class="example-map">
    <iframe
        id="guides-interactivity-events-step-2"
        src="/developers/carto-vl/examples/maps/guides/interactivity/step-2.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>


### Using Variables
*Variables* are a way to store and reuse expressions, and that can definitively help you when adding interactions to your visualization, so let's practice a bit with them.

#### Variables without properties
First you are going to add a variable whose value depends solely on the current map extent. Replace your current <del>`const viz = new carto.Viz();`</del>, with this code that grabs the current displayed features using the *String API*:
```js
const viz = new carto.Viz(`
    @currentFeatures: viewportFeatures()
`);
```

And then you should add this to handle the updates after each change, when you change the map's extent:
```js
layer.on('updated', () => {
    const numberOfFeatures = viz.variables.currentFeatures.value.length;
    console.log(`Now you can see ${numberOfFeatures} cities`);
});
```
> Notice how the variable can be accessed directly from the `carto.Viz` object, inside its `variables` array, without the `@` symbol and using `.value`. This is possible cause it has no `properties` related to the features themselves.

You can imagine previous `layer:updated` event is a kind of `layer:viz-updated` event, notifying you whenever something relevant has changed in the viz attached to the layer.

If you want to reduce the number of `console.log` entries, caused by the `map:move`, you can remove its handler with:
```js
map.off('move', displayCenter);
```

You have already advanced a lot in this guide, take a rest and check your work against this:
<div class="example-map">
    <iframe
        id="guides-interactivity-events-step-3"
        src="/developers/carto-vl/examples/maps/guides/interactivity/step-3.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

#### Data-driven variables
If the data you are interested in is some kind of feature property, such as the name of each city or its population, then you can use variables to store them, and that variables will change their contents for each of the cities as you interact with them.

Edit again your viz, so it looks like this:
```js
const viz = new carto.Viz(`
    @currentFeatures: viewportFeatures()
    @name: $name
    @pop: $
`);
```





### Feature events










### Adding pop-ups
Pop-ups are merging little windows with feature information.

### Interactive-based styling

---

### All together

Congrats! You have finished this guide. The final map should look like this:
<div class="example-map">
    <iframe
        id="guides-sources-source-sql"
        src="https://carto.com/developers/carto-vl/examples/maps/guides/interactivity/XXXXX.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>


This is the complete code:
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
            zoom: 2,
            scrollZoom: false,
            dragRotate: false,
            touchZoomRotate: false,
        });
        // Add zoom controls
        const nav = new mapboxgl.NavigationControl({
            showCompass: false
        });
        map.addControl(nav, 'top-left');


        //** CARTO VL functionality begins here **//


    </script>
</body>

</html>
```
