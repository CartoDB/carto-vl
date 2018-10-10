## Aggregating data

In this guide you will explore a set of functions called **aggregations** (aggr.), that will allow you to extract different values from your datasets considering the whole set of features (*global aggr.*), just the ones in the current map extent (*viewport aggr.*) or from spatial aggregations (*cluster aggr.*).


### Global aggregations
When you are working with a dataset, odds are that you are interested in comparing a feature with the rest of them. For example, _"is the population density in this neighborhood bigger than the average?"_. Or maybe you just want to display in a table some basic statistics describing the whole dataset.

For these cases, CARTO VL provides you with a set of functions automatically calculated for the whole dataset (hence *global* functions):
- `globalMin`: calculates the minimum value.
- `globalMax`: calculates the maximum value.
- `globalSum`: calculates the sum of all values.
- `globalCount`: calculates the number of features.
- `globalAvg`: calculates the average value.
- `globalPercentile`: calculates the Nth percentile.

Let's use some of them with our cities dataset. You can start as usual from a [basemap](/developers/carto-vl/examples/maps/guides/getting-started/step-1.html). Take its source code and copy it to a new file called `aggregations.html`. Now you're ready to start.

Then create a visualization adding the cities layer and 3 variables with global functions using this code:
```js
const citiesSource = new carto.source.Dataset('populated_places');
const citiesViz = new carto.Viz(`
    color: grey
    width: 10
    @g_max: globalMax($pop_max)
    @g_avg: globalAvg($pop_max)
    @g_p95: globalPercentile($pop_max, 95)
`);
const citiesLayer = new carto.Layer('cities', citiesSource, citiesViz);
citiesLayer.addTo(map);
```
> The use of `g_` prefix is not required but it can be useful as an indicator of a _global_ variable. Don't forget to add your credentials as usual, using `carto.setDefaultAuth({ username: 'cartovl', apiKey: 'default_public'});` to be able to connect to the CARTO dataset.

For a review of these variables, add a `console.log` sentence once the layer has loaded:
```js
citiesLayer.on('loaded', () => {
    const v = citiesViz.variables;
    console.log(`
        Maximum: ${v.g_max.value}
        Average: ${v.g_avg.value.toFixed(0)}
        95th percentile: ${v.g_p95.value}
    `);
});
```

Global functions can be easily combined with other capabilities, such as `filter`. For example, you can display just the biggest cities in the world with this little addition to your `viz`:
```js
const citiesViz = new carto.Viz(`
    color: grey
    width: 10
    @g_max: globalMax($pop_max)
    @g_avg: globalAvg($pop_max)
    @g_p95: globalPercentile($pop_max, 95)
    filter: ($pop_max > @g_p95)
`);
```
> How about using filtering to display just the biggest city in the world? How would you create a filter for that? Give it a quick try and then keep on working in the guide...

The result using previous global functions should look like this:
<div class="example-map">
    <iframe
        id="guides-aggregations-step-1"
        src="/developers/carto-vl/examples/maps/guides/aggregations/step-1.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>
To open the map at this step, use this [link to the map](/developers/carto-vl/examples/maps/guides/aggregations/step-1.html), where you can check the console messages.


### Viewport aggregations
Sometimes you want to extract relevant information from the current view of the map (the **viewport**), understanding *What am I exactly seeing now?*. And a set of functions is included in CARTO VL to help you in this case.

In an analogous way with the global ones, you have available these functions:
- `viewportMin`
- `viewportMax`
- `viewportSum`
- `viewportCount`
- `viewportAvg`
- `viewportPercentile`

> Obviously, the features that don't pass any possible filter you have placed (hence not visible), will be excluded from the calculations.

You'll practice now to use some of them, adding several to the current viz. First, add some viewport functions to sum the population in the current view and to get the biggest and lowest population values, with this code:
```js
const citiesViz = new carto.Viz(`
    color: grey
    width: 10
    @g_max: globalMax($pop_max)
    @g_avg: globalAvg($pop_max)
    @g_p95: globalPercentile($pop_max, 95)
    filter: ($pop_max > @g_p95)
    // filter: $pop_max == @g_max // biggest city is Tokyo!
    @v_sum: viewportSum($pop_max)
    @v_max: viewportMax($pop_max)
    @v_min: viewportMin($pop_max)
`);
```
> Notice how you can also use a convention to name your "viewport-related" variables, for example with a `v_` prefix.

As a check, show the new variable values in the console
```js
citiesLayer.on('updated', () => {
    const v = citiesViz.variables;
    console.log(`
        Viewport Sum: ${v.v_sum.value}
        Viewport Max: ${v.v_max.value}
        Viewport Min: ${v.v_min.value}
    `);
});
```
> Move the map to see how the values get updated.

Now you are going to display those values in a panel, which is pretty common, instead of just logging them to the console.

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

To improve a bit how you are going to display those big population numbers, we're going to import first a formatting library called [numeraljs](http://numeraljs.com/). So you have to add inside the `<head>` section:
```html
<!-- Numeral.js for number formatting -->
<script src="//cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/numeral.min.js"></script>
```

And now to let's display some interesting figures in that panel!.

You should add this (back again into your JavaScript code, inside the current handler for the layer updates):

```js
citiesLayer.on('updated', () => {
    const v = citiesViz.variables;
    // Displaying values in the console
    console.log(`
        Viewport Sum: ${v.v_sum.value}
        Viewport Max: ${v.v_max.value}
        Viewport Min: ${v.v_min.value}
    `);

    // NEW CODE HERE...>>>
    // Displaying values in the panel
    const sum = numeral(v.v_sum.value).format('0.0a');
    const highest = numeral(v.v_max.value).format('0.0a');
    const lowest = numeral(v.v_min.value).format('0.0a');
    const html = `
        <h2>${sum}</h2>
        <p>The city with less population in the map has <strong>${lowest}</strong>
            and the biggest has <strong style='color:red;'>${highest}</strong> people</p>
    `;
    const panelContent = document.querySelector('.js-population');
    panelContent.innerHTML = v.v_sum.value > 0 ? html : 'There are no cities here!';
});
```
> Notice how we used `numeral` from the external library, and its `.format` method to display millions of people. And


As a nice complement, you can now change the _color_ and _size_ of the city with more population right now on the screen, using this code (replace in the current viz the `color: grey` and `width: 10` with:
```
color: blend(gray, red, @f_isBiggest)
width: blend(10, 40, @f_isBiggest)
```

And add this new variable to the same viz:
```
@f_isBiggest: ($pop_max == @v_max)
```

> Notice how `blend` works here as a convenient way to apply a conditional style, where its parameters can be interpreted as `blend(FALSE_VALUE, TRUE_VALUE, CONDITION)`. See also that we named our feature-dependent variable with a `@f_` prefix.

You can also remove the current filter, to display more cities at the same time. Just add `//` before the `filter` line in the `viz` definition, like this:
```
// filter: ($pop_max > @g_p95)
```
> This is a practical way to de-activate a filter without removing it from the code, maybe for future reference.


At this point, you have created this great visualization, using global and viewport functions:
<div class="example-map">
    <iframe
        id="guides-aggregations-step-2"
        src="/developers/carto-vl/examples/maps/guides/aggregations/step-2.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>
To explore the map at full screen size, have a look at [this link](/developers/carto-vl/examples/maps/guides/aggregations/step-2.html) and see the biggest cities in the world (Tokyo, New York, Mumbay...).


### Resolution

> TIP: If you are using a lot of points in your viz and the current symbols overlap, changing the resolution is a way to improve the rendering, specially when in a low zoom level, because you'll get less points by clustering them.


### Clustering
