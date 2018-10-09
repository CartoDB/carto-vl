## Aggregating data

In this guide you will explore a set of functions called **aggregations**, that will allow you to extract different values from your datasets considering the whole set of features (*global*), just the ones in the current map extent (*viewport*) or from spatial aggregations (*cluster*).


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

Then create a visualization with the cities layer and 3 variables using global functions, with this code:
```js
const citiesSource = new carto.source.Dataset('populated_places');
const citiesViz = new carto.Viz(`
    color: grey
    width: 15
    @g_max: globalMax($pop_max)
    @g_avg: globalAvg($pop_max)
    @g_p95: globalPercentile($pop_max, 95)
`);
const citiesLayer = new carto.Layer('cities', citiesSource, citiesViz);
citiesLayer.addTo(map);
```
> The use of `g_` prefix is not required but it can be useful as a reminder of a _global_ variable. And don't forget to always add your credentials, using `carto.setDefaultAuth({ username: 'cartovl', apiKey: 'default_public'});` to connect to the CARTO dataset.

For a review of these variables, add a console.log sentence once the layer has loaded:
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

Global functions can be easily combined with other capabilities, such as `filter`. For example, you can display just the biggest cities in the world with a little addition to your `viz`:
```js
const citiesViz = new carto.Viz(`
    color: grey
    width: 15
    @g_max: globalMax($pop_max)
    @g_avg: globalAvg($pop_max)
    @g_p95: globalPercentile($pop_max, 95)
    filter: ($pop_max > @g_p95)
`);
```
> How about using filtering instead to display just the biggest city in the world? How would you create a filter for that? Give it a quick try...

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


### Viewport aggregation
Sometimes you just want to extract some information from the current view of the map (the **viewport**), that is: *What am I exactly seeing here?*

Obviously,

### Resolution

### Clustering
