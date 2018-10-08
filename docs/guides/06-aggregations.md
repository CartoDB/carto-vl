## Aggregating data

In this guide you will explore a set of functions called **aggregations**, that will allow you to extract different values from your datasets, considering the whole set of features (*global*), just the ones in the current map extent (*viewport*) or properties derived from spatial aggregations (*cluster*).


### Global aggregations
When you are working with a dataset, odds are that you are interested in comparing a feature with the rest of them. For example, "is the population density in this neighborhood bigger than the average?". Or maybe you just want to display in a table some basic statistics describing the whole dataset.

For these cases, CARTO VL provides you with a set of functions automatically calculated for the dataset (hence *global* functions):
- `globalMin`: calculates the minimum value.
- `globalMax`: calculates the maximum value.
- `globalSum`: calculates the sum of all values.
- `globalCount`: calculates the number of features.
- `globalAvg`: calculates the average value.
- `globalPercentile`: calculates the Nth percentile.

Let's use some of them within our cities dataset. You can start as usual from a [basemap](/developers/carto-vl/examples/maps/guides/getting-started/step-1.html). Take its source code and copy it to a new called `aggregations.html`. Now you're ready to start.

Then add the cities layer using this code:
```js
const citiesSource = new carto.source.Dataset('populated_places');
const citiesViz = new carto.Viz(`
    color: grey
    width: 4
    @min: globalMin($pop_max)
    @max: globalMax($pop_max)
    @avg: globalAvg($pop_max)
`);
const citiesLayer = new carto.Layer('cities', citiesSource, citiesViz);
citiesLayer.addTo(map);
```



### Viewport aggregation
Sometimes you just want to extract some information from the current view of the map (the **viewport**), that is: *What am I exactly seeing here?*

Obviously,

### Resolution

### Clustering
