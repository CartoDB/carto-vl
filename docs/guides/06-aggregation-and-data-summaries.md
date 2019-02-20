## Aggregation and data summaries

In this guide you will explore a set of functions called **aggregations**, that allow you to extract different values from your datasets by considering either the whole set of features (*global aggregations*), just the ones displayed in the current map extent (*viewport aggregations*) or those derived from spatial aggregations (*cluster aggregations*).


### Global aggregations
When you are working with a dataset, odds are that you are interested in comparing a feature with the rest of them. For example, _"is the population density in this neighborhood bigger than the average?"_. Or maybe you just want to display in a table some basic statistics describing the whole dataset.

For these cases, CARTO VL provides you with a set of *global* functions that are automatically calculated for the entire dataset:
- `globalMin`: calculates the minimum value.
- `globalMax`: calculates the maximum value.
- `globalSum`: calculates the sum of all values.
- `globalCount`: calculates the number of features.
- `globalAvg`: calculates the average value.
- `globalPercentile`: calculates the Nth percentile.

Let's use some of them with our cities dataset. You can start with the [basemap](/developers/carto-vl/examples/maps/guides/getting-started/step-1.html) template. Take its source code and copy it to a new file called `aggregations.html`.

Next, create a visualization adding the cities layer and 3 variables with global functions, using this code:
```js
const source = new carto.source.Dataset('populated_places');
const viz = new carto.Viz(`
    color: grey
    width: 10
    @g_max: globalMax($pop_max)
    @g_avg: globalAvg($pop_max)
    @g_p95: globalPercentile($pop_max, 95)
`);
const layer = new carto.Layer('cities', source, viz);
layer.addTo(map);
```

**Note:**
The use of `g_` prefix is not required but it can be useful as an indicator of a _global_ variable.

For a review of these variables, add a `console.log` sentence once the layer has `loaded` (to know more about _events_, have a look at the [Add interactivity and events Guide](/developers/carto-vl/guides/add-interactivity-and-events):
```js
function displayGlobalValues() {
    console.log(`
        Maximum: ${viz.variables.g_max.value}
        Average: ${viz.variables.g_avg.value.toFixed(0)}
        95th percentile: ${viz.variables.g_p95.value}
    `);
}
layer.on('loaded', displayGlobalValues);
```

**Note:**
Creating a named function allows deactivating the listener for the layer later on, with `layer.off`.

Global functions can be combined with other capabilities, such as `filter`. For example, you can display just the biggest cities in the world with this little addition to your `viz`:
```js
const viz = new carto.Viz(`
    color: grey
    width: 10
    @g_max: globalMax($pop_max)
    @g_avg: globalAvg($pop_max)
    @g_p95: globalPercentile($pop_max, 95)
    filter: ($pop_max > @g_p95)
`);
```

**Note:**
How about using a filter to display only the biggest city in the world? How would you create a filter for that? Give it a quick try and then keep on working through the guide...

The result using the global functions in the previous step should look like this:
<div class="example-map">
    <iframe
        id="guides-aggregations-step-1"
        src="/developers/carto-vl/examples/maps/guides/aggregation-and-data-summaries/step-1.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>

To open the map at this step, use this [link to the map](/developers/carto-vl/examples/maps/guides/aggregation-and-data-summaries/step-1.html), where you can check the console messages.

**Note:**
To display only the biggest city in the world change your filter to `filter: $pop_max == @g_max // biggest city is Tokyo!`.


### Viewport aggregations
Sometimes you want to extract relevant information from the current view of the map (the **viewport**), to better understand *What am I seeing in the current map view?*. A set of *viewport* functions are available in CARTO VL for these cases.

In an analogous way to *global* functions, these are the available *viewport* functions:
- `viewportMin`
- `viewportMax`
- `viewportSum`
- `viewportCount`
- `viewportAvg`
- `viewportPercentile`

**Note:**
It is important to note that features that have been removed using a `filter` are not visible and will be excluded from the aggregation calculations.

Let's try some out by adding them to the current `viz`. First, add some functions to sum the population in the current viewport and also to get the highest and lowest population values:
```js
const viz = new carto.Viz(`
    color: grey
    width: 10
    @g_max: globalMax($pop_max)
    @g_avg: globalAvg($pop_max)
    @g_p95: globalPercentile($pop_max, 95)
    filter: ($pop_max > @g_p95)
    @v_sum: viewportSum($pop_max)
    @v_max: viewportMax($pop_max)
    @v_min: viewportMin($pop_max)
`);
```

**Note:**
Notice how you can also use a convention to name your "viewport-related" variables, for example, with a `v_` prefix.

As a check, show the new variable values in the console, which will be updated as you move the map:
```js
function displayViewportValues() {
    console.log(`
        Viewport Sum: ${viz.variables.v_sum.value}
        Viewport Max: ${viz.variables.v_max.value}
        Viewport Min: ${viz.variables.v_min.value}
    `);
}
layer.on('updated', displayViewportValues);
```

Next you are going to display those values in a panel, which is pretty common, instead of just logging them to the console.

Add this to your **HTML** code (NOT inside the `<script>` tags), just after the map:
```html
<div id="map"></div>

<aside class="toolbox">
    <div class="box">
        <header>
            <h1>Population</h1>
        </header>
        <section class="open-sans">
            <div class="separator"></div>
            <div class="js-population">
                <!-- updated content will be displayed here -->
            </div>
        </section>
    </div>
</aside>
```

To improve a bit how the high population numbers display, we're going to first import a formatting library called [`numeraljs`](http://numeraljs.com/). To add it, paste the following inside the `<head>` section of your file:
```html
<!-- Numeral.js for number formatting -->
<script src="//cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/numeral.min.js"></script>
```

And now let's display some interesting figures in that panel!

To continue, add this code (back again into your JavaScript, inside the current `displayViewportValues` function, attached to the layer updates):

```js
function displayViewportValues(){
    // In the console
    console.log(`
        Viewport Sum: ${viz.variables.v_sum.value}
        Viewport Max: ${viz.variables.v_max.value}
        Viewport Min: ${viz.variables.v_min.value}
    `);

    // NEW CODE GOES HERE...>>>
    // Displaying values in the panel
    const sum = numeral(viz.variables.v_sum.value).format('0.0a');
    const highest = numeral(viz.variables.v_max.value).format('0.0a');
    const lowest = numeral(viz.variables.v_min.value).format('0.0a');
    const html = `
        <h2>${sum}</h2>
        <p>The city with less population in the map has <strong>${lowest}</strong>
            and the biggest has <strong style='color:red;'>${highest}</strong> people</p>
    `;
    const panelContent = document.querySelector('.js-population');
    panelContent.innerHTML = viz.variables.v_sum.value > 0 ? html : 'There are no cities here!';
}
layer.on('updated', displayViewportValues);
```

**Note:**
Notice how we have used `numeral` from the external library, and its `.format` method to display millions of people.

As a nice complement, you can now change the _color_ and _size_ of the city with highest population on the screen using this code (replace `color: grey` and `width: 10` in the current `viz` with):
```CARTO_VL_Viz
color: blend(gray, red, @f_isBiggest)
width: blend(10, 40, @f_isBiggest)
```

And add this new variable to the same `viz`:
```CARTO_VL_Viz
@f_isBiggest: ($pop_max == @v_max)
```

**Note:**
Notice how `blend` works here as a convenient way to apply a *conditional style*, where its parameters can be interpreted as `blend(FALSE_VALUE, TRUE_VALUE, CONDITION)`; in our case it could be read as "if the feature is the biggest (its pop_max is the maximum value in the viewport), display it in red and a bigger size". See also that we named our feature-dependent variable with a `@f_` prefix.

As a test, you can temporary disable (and then enable again) the current filter, to display more cities at the same time. This is a practical way to de-activate a filter, without removing it from the code. Just add `//` before the `filter` line in the `viz` definition to comment it out, like this:
```CARTO_VL_Viz
// filter: ($pop_max > @g_p95)
```

At this point, you have created this great visualization, using global and viewport functions:
<div class="example-map">
    <iframe
        id="guides-aggregations-step-2"
        src="/developers/carto-vl/examples/maps/guides/aggregation-and-data-summaries/step-2.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>

To explore the map at full screen size, have a look at [this link](/developers/carto-vl/examples/maps/guides/aggregation-and-data-summaries/step-2.html) and see the biggest cities in the world (Tokyo, New York, Mumbay...).


### Resolution
Resolution is an interesting property to know about when you are displaying a point layer and using the **CARTO backend** (`carto.source.Dataset` or `carto.source.SQL`). Resolution is a value that defines the spatial aggregation for your features ranging from **1 pixel** (default) to **255 pixels**.

A regular grid is internally created with cells sized by the number of pixels defined as the `resolution` value. Any feature falling in the same cell will be aggregated into a _clustered point_. That point's position will be determined by the current [centroid](https://carto.com/help/glossary/#centroid) of the features found inside each cell (aggregation placement is always set to `centroid` mode).

Give it a try by modifying the default resolution of `1` in the current `viz` by adding this property and value:
```CARTO_VL_Viz
resolution: 128
```
Remember, if there is no explicit value, `resolution = 1`. Common resolution values are usually `<=16`.

That should be enough to set the resolution and reduce the number of points, but depending on the layer it might be difficult to be perceived without further modifications. Let's add more properties to grasp the concept, removing the `filter` and changing the `width`, using this:
```js
const viz = new carto.Viz(`
    color: blend(gray, red, @f_isBiggest)
    width: 5 * clusterCount()

    @g_max: globalMax($pop_max)
    @g_avg: globalAvg($pop_max)
    @g_p95: globalPercentile($pop_max, 95)

    @v_sum: viewportSum($pop_max)
    @v_max: viewportMax($pop_max)
    @v_min: viewportMin($pop_max)

    @f_isBiggest: ($pop_max == @v_max)
    resolution: 128
`);
```

**Note:**
`clusterCount` is the number of points aggregated inside each cluster. We will take a more thorough look at clustered functions in the next section.


>**Tip**: When you are visualizing a high density of points, it is likely that the symbols in your visualization overlap. Changing the resolution is an effective way to improve the visualization, particularly at low zoom levels, since all points in a cell are summarized into clustered symbology. The resolution is always a balance between spatial accuracy and readability.


### Clustering aggregations
The last group of aggregation functions are clusters, which are related to the previous concept of resolution and its spatial aggregations.

This is the set of available operations, pretty similar to the corresponding `global` and `viewport`, which are:
- `clusterMin`
- `clusterMax`
- `clusterSum`
- `clusterCount`
- `clusterAvg`
- `clusterMode`: aggregate into points using the mode. This makes sense using a _Category_ type of property.

Now let's use a pretty useful one as an example, the `clusterSum`, to modify the symbol's size (`width` property).

Modify the current `width: 5 * clusterCount()` to:
```CARTO_VL_Viz
width: sqrt(clusterSum($pop_max) / 5000) + 5
```

In the previous expression, the aggregated population in the cluster is used to determine the circle size (helped with some maths to manually adjust values to pixels).

But if you just replace that property in the current `viz` configuration, you'll get a `CartoValidationError: [Incorrect value]: Incompatible combination of cluster aggregation usages`, because you are mixing aggregated and unaggregated usages of the same property *pop_max*. So it is better if you just simplify the viz.

Change your `viz` code to this:
```js
const viz = new carto.Viz(`
    color: red
    width: sqrt(clusterSum($pop_max) / 50000) + 5
    resolution: 16
`);
```

And to fix some errors caused by the lack of previous variables, deactivate these handlers:
```js
layer.off('loaded', displayGlobalValues)
layer.off('updated', displayViewportValues);
```

---

Congrats, you made your way through this guide!. This is the result:
<div class="example-map">
    <iframe
        id="guides-aggregations-step-3"
        src="/developers/carto-vl/examples/maps/guides/aggregation-and-data-summaries/step-3.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>

You can explore the final step [here](/developers/carto-vl/examples/maps/guides/aggregation-and-data-summaries/step-3.html)

This is the complete code:
```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <script src="https://libs.cartocdn.com/carto-vl/%VERSION%/carto-vl.min.js"></script>
    <script src="https://api.tiles.mapbox.com/mapbox-gl-js/v0.52.0/mapbox-gl.js"></script>
    <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.52.0/mapbox-gl.css" rel="stylesheet" />
    <link rel="stylesheet" type="text/css" href="../../style.css">
    <!-- Numeral.js for number formatting -->
    <script src="//cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/numeral.min.js"></script>
</head>

<body>
    <div id="map"></div>
    <aside class="toolbox">
        <div class="box">
            <header>
                <h1>Population</h1>
            </header>
            <section class="open-sans">
                <div class="separator"></div>
                <div class="js-population">
                    <!-- updated content will be displayed here -->
                </div>
            </section>
        </div>
    </aside>

    <script>
        const map = new mapboxgl.Map({
            container: 'map',
            style: carto.basemaps.voyager,
            center: [0, 30],
            zoom: 2
        });
        const nav = new mapboxgl.NavigationControl();
        map.addControl(nav, 'top-left');

        carto.setDefaultAuth({
            username: 'cartovl',
            apiKey: 'default_public'
        });

        // GLOBAL AGGREGATIONS + VIEWPORT AGGRS.
        const source = new carto.source.Dataset('populated_places');
        const viz = new carto.Viz(`
            color: red
            width: sqrt(clusterSum($pop_max) / 50000) + 5
            resolution: 16
        `);
        const layer = new carto.Layer('cities', source, viz);
        layer.addTo(map);

        // Display 3 variables with global aggregation functions
        function displayGlobalValues() {
            console.log(`
                Maximum: ${viz.variables.g_max.value}
                Average: ${viz.variables.g_avg.value.toFixed(0)}
                95th percentile: ${viz.variables.g_p95.value}
            `);
        }
        layer.on('loaded', displayGlobalValues);

        // Display viewport-derived values
        function displayViewportValues() {
            // In the console
            console.log(`
                Viewport Sum: ${viz.variables.v_sum.value}
                Viewport Max: ${viz.variables.v_max.value}
                Viewport Min: ${viz.variables.v_min.value}
            `);

            // In the panel
            const sum = numeral(viz.variables.v_sum.value).format('0.0a');
            const highest = numeral(viz.variables.v_max.value).format('0.0a');
            const lowest = numeral(viz.variables.v_min.value).format('0.0a');
            const html = `
                <h2>${sum}</h2>
                <p>The city with less population in the map has <strong>${lowest}</strong>
                    and the biggest has <strong style='color:red;'>${highest}</strong> people</p>
            `;
            const panelContent = document.querySelector('.js-population');
            panelContent.innerHTML = viz.variables.v_sum.value > 0 ? html : 'There are no cities here!';
        }
        layer.on('updated', displayViewportValues);

        // Deactivate after removing viewport variables from viz
        layer.off('loaded', displayGlobalValues)
        layer.off('updated', displayViewportValues);
    </script>
</body>

</html>
```
