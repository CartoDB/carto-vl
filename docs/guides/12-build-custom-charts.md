## Build custom charts

In the [Add legends](/developers/carto-vl/guides/add-legends/) guide, you saw how to add legends to a map using the `getLegendsData` method, and how to display widgets using histogram expressions in the [Add widgets](/developers/carto-vl/guides/add-widgets/) guide. In this guide, you will build upon those concepts and learn how to obtain and display information in custom charts using the `viewportHistogram` and `sampleHistogram` expressions and an external charting library.

### Overview

In the [previous guide](/developers/carto-vl/guides/add-widgets/) histogram widgets were built with CARTO's frontend framework [Airship](https://carto.com/airship/). As explained there, Airship widgets interact with CARTO VL directly, which means widgets are automatically connected to the map and can be configured accordingly. This guide takes a deeper dive into histogram expressions and the flexibility in CARTO VL to connect with external libraries. You will learn how to use histogram expressions to create bar charts for **categorical** data and histograms for **numeric** data using a [Vancouver Trees](https://team.carto.com/u/cartovl/tables/cartovl.vancouver_trees/public/map) dataset with the external charting library, [Chart.js](https://www.chartjs.org).

### Histogram expressions

CARTO VL has two expressions to create histograms: `viewportHistogram` and `sampleHistogram`. Both expressions return a list of values grouped by a column but differ in the way values are grouped. The `viewportHistogram` expression returns a list based off of features that are in the viewport, while the `sampleHistogram` expression returns a list based on a data sample.

#### `viewportHistogram` vs `sampleHistogram`

The map below combines both `viewportHistogram` and `sampleHistogram` expressions to compare the information returned for viewport vs sample feature calculations. If you interact with the map, you'll see how the bars for `sampleHistogram` remain static, while the ones for `viewportHistogram` change depending on the features present in the viewport.

What you may notice is that if you zoom out, the `viewportHistogram` chart doesn't match the `sampleHistogram` chart. This is because the data returned for the `sampleHistogram`, as indicated by its name, is a **representative sample** of the data. Therefore, the results may vary since we're comparing the viewport data with a representative sample of the whole dataset.

**Note:**
If you need higher accuracy in your `sampleHistogram`,  we recommend creating a [custom query](https://wiki.postgresql.org/wiki/Aggregate_Histogram) with a [`carto.source.SQL`](/developers/carto-vl/reference/#cartosourcesql) source.

<div class="example-map">
  <iframe
    id="guides-widgets-advanced-step-3"
    src="/developers/carto-vl/examples/maps/guides/build-custom-charts/step-1.html"
    width="100%"
    height="550"
    style="margin: 20px auto !important"
    frameBorder="0">
  </iframe>
</div>
You can explore this step [here](/developers/carto-vl/examples/maps/guides/build-custom-charts/step-1.html)

Now that you know the differences between viewport and sample histograms, next, let's look at using these expressions to draw charts.

#### Bar chart for categories

First, let's start with a basic bar chart that displays the count of trees planted on each **street side** category (describing whether a tree is planted on the odd, even, or middle side of a street) using the `viewportHistogram` expression.

To start, define the source dataset and create a variable (`@v_histogram`) in the `viz` that will return the count and category information for the chart:

```js
  // Define the source
  const source = new carto.source.Dataset('vancouver_trees');

  // Define the visualization
  const viz = new carto.Viz(`
    @v_histogram: viewportHistogram($street_side_name)
  `);
```

In order to draw a basic chart, start with a default configuration:

```js
const chartOptionsDefault = {
  animation: {
    duration: 0
  },
  legend: {
    display: false
  },
  scales: {
    yAxes: [{
      gridLines: {
        drawBorder: false,
        display: false
      },
      ticks: {
        suggestedMin: 1,
        beginAtZero: true,
        display: false
      }
    }],
    xAxes: [{
      gridLines: {
        drawBorder: false,
        display: false
      },
      ticks: {
        display: false
      },
      barPercentage: 0.9,
      categoryPercentage: 1.0
    }]
  }
};

const chart = new Chart(ctx, {
  type: 'bar',
  options: chartOptionsDefault
});
```

In order for Chart.js to populate the bar chart with information from the Vancouver Trees dataset, it needs three arrays:

* `labels`: array of string values that indicate the label of each bar.
* `data`: array of numeric values that indicate the height of each bar.
* `backgroundColor`: array of colors that will be applied to each bar in the chart from left to right. If you assign a single color, all bars will be colored the same.

The `v_histogram.value` returns an array of `{ x, y }` objects where `x` is the name of the street side category and `y` is the amount of trees in that category. This is the information used to build the `data` and `labels` arrays for the bar chart. For `backgroundColor` let's assign a solid color (we will explore how to modify this later in the guide).  

Since the values will be dynamically updated based on the viewport, the information should be returned **once the layer is updated**:

```js
layer.on('updated', () => {
  // Get histogram data
  const histogramData = layer.viz.variables.v_histogram.value;

  // Chart.js set up
  const labels = histogramData.map(elem => elem.x);
  const data = histogramData.map(elem => elem.y);
  const backgroundColor = '#00718b';

  chart.data = {
    labels,
    datasets: [{
      data,
      backgroundColor
    }]
  };

  chart.update();
});
```

On the resulting map, you will notice as you interact with it (zoom and pan) that the bars in the chart dynamically update based on the data in your current viewport. You can also hover over each bar in the chart to see the category name and count.

<div class="example-map">
  <iframe
    id="guides-widgets-advanced-step-1"
    src="/developers/carto-vl/examples/maps/guides/build-custom-charts/step-2.html"
    width="100%"
    height="550"
    style="margin: 20px auto !important"
    frameBorder="0">
  </iframe>
</div>
You can explore this step [here](/developers/carto-vl/examples/maps/guides/build-custom-charts/step-2.html)

#### Histogram for numbers

Next, let's take a look at building a histogram to show the distribution of a numeric value, **tree diameter**.  

For this case, let's create a chart with six histogram bars that count the number of trees within each diameter range. To get this information, classify the diameter values into six buckets based on the viewport:

```js
const viz = new carto.Viz(`
  @v_histogram: viewportHistogram($diameter, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]])
`);
```
On the resulting map, you will see a histogram with six bars for each diameter bucket and the count of trees in each one. Similar to the map above, the histogram bars dynamically update and can be hovered for more detailed information.

<div class="example-map">
  <iframe
    id="guides-widgets-advanced-step-2"
    src="/developers/carto-vl/examples/maps/guides/build-custom-charts/step-3.html"
    width="100%"
    height="550"
    style="margin: 20px auto !important"
    frameBorder="0">
  </iframe>
</div>
You can explore this step [here](/developers/carto-vl/examples/maps/guides/build-custom-charts/step-3.html)

#### Using `top()`

In the first example you saw how to create a chart for all category values in the street side attribute. While that attribute has four unique values, there will be other times where you may want to summarize category values in your chart based on the data. For example, if we take an attribute like tree **species name** there are many categories, but in the chart, you only want to display the **top five** tree species and their count. 

You can do this using the [`top`](https://carto.com/developers/carto-vl/reference/#cartoexpressionstop) expression inside of the histogram expression: 

```js
const viz = new carto.Viz(`
  @v_histogram: viewportHistogram(top($species_name, 5))
`);
```
As you can see in the map below, the result is a chart with the top 5 tree species in the data and all other values in an others bucket:

<div class="example-map">
  <iframe
    id="guides-widgets-advanced-step-4"
    src="/developers/carto-vl/examples/maps/guides/build-custom-charts/step-4.html"
    width="100%"
    height="550"
    style="margin: 20px auto !important"
    frameBorder="0">
  </iframe>
</div>
You can explore this step [here](/developers/carto-vl/examples/maps/guides/build-custom-charts/step-4.html)

**Note:**
At this time, `top` is the **only expression** available for use with histograms.

#### Assign bar colors with `getJoinedValues`

In all of the examples above, you will notice that the bar colors are a solid default color defined in the default chart properties. 

What if you want to create a bar chart, and assign colors to each bar that correspond with the associated features on the map?

You can do this with a `ramp` expression, the [`getLegendData()`](/developers/carto-vl/reference/#expressionsrampgetlegenddata) method, and the [`getJoinedValues()`](/developers/carto-vl/reference/#expressionsviewporthistogramgetjoinedvalues) method which is part of `viewportHistogram` and `sampleHistogram`.

The `ramp` expression (`@v_color`) is used to in two ways: to color the features on the map and to color the chart's bars with the same colors using the `getLegendData()` method:

```js
const viz = new carto.Viz(`
  @v_color: ramp($species_name, Vivid)
  @v_histogram: viewportHistogram($species_name)
  color: @v_color
`);
```

The ramp (`@v_color`) and histogram (`@v_histogram`) variables are then used to access to the `getLegendData` and `getJoinedValues` methods respectively:

```js
// Save histogram variable
const histogram = layer.viz.variables.v_histogram;
// Save color variable
const color = layer.viz.variables.v_color;
// Get color ramp legend
const colorValues = color.getLegendData();
// Get histogram data
const histogramData = histogram.getJoinedValues(colorValues.data);
```

It is important to take into account that `getJoinedValues` returns an array of `{ key, value, frequency }` elements sorted by frequency. In this case, the value contains a **color** because it is a **color ramp**.

* key: The name or id that identifies the value
* frequency: The total count of this value
* value: The value assigned to the data from the ramp

These are the properties needed to build the chart's bars where the labels come from the `key` property, the data from `frequency`, and the colors from `value`:

```js
// Chart.js set up
const labels = histogramData.map(elem => elem.key);
const data = histogramData.map(elem => elem.frequency);
const colors = histogramData.map(elem => elem.value);
```

<div class="example-map">
  <iframe
    id="guides-widgets-advanced-step-5"
    src="/developers/carto-vl/examples/maps/guides/build-custom-charts/step-5.html"
    width="100%"
    height="550"
    style="margin: 20px auto !important"
    frameBorder="0">
  </iframe>
</div>
You can explore this step [here](/developers/carto-vl/examples/maps/guides/build-custom-charts/step-5.html)

But, what if you want to create a chart for a map that uses the `top` expression? How can you tell the bar chart which colors are needed to display only the top five categories? The answer is to use the **same operation** in both the ramp and histogram expressions. 

In this case, that means using `top` for both the histogram (`@v_histogram`), and the ramp (`@v_color`):

```js
const viz = new carto.Viz(`
  @v_color: ramp(top($species_name, 5), Vivid)
  @v_histogram: viewportHistogram(top($species_name, 5))
  color: @v_color
`);
```

Since both share the same `top` expression, it can be written to a variable (`@top_five`). With some refactoring of the visualization, we have the equivalent as above:

```js
const viz = new carto.Viz(`
  @top_five: top($species_name, 5)
  @v_color: ramp(@top_five, Vivid)
  @v_histogram: viewportHistogram(@top_five)
  color: @v_color
`);
```

The `top` expression places all other values (that are not the _top_ ones) into an **'others'** bucket. In CARTO VL, by default, this bucket is labeled `CARTO_VL_OTHERS`. 

This can be overwritten by passing an `options` object with the desired text set in `othersLabel`and setting that **same options** object to both the `getLegendData` and `getJoinedValues` methods:

```js
// Save histogram variable
const histogram = layer.viz.variables.v_histogram;
// Save color variable
const color = layer.viz.variables.v_color;
// Get color ramp legend
const options = {
  othersLabel: 'OTHER SPECIES'
};
const colorValues = color.getLegendData(options);
// Get histogram data
const histogramData = histogram.getJoinedValues(colorValues.data, options);

// Chart.js set up
const labels = histogramData.map(elem => elem.key);
const data = histogramData.map(elem => elem.frequency);
const colors = histogramData.map(elem => elem.value);
```

In the resulting map, both the map features and bars in the chart are colored by the top five tree species in the data. In addition, the bar for "others" is appropriately labeled. As in previous examples, the bars update with the appropriate information as you interact with the map and features in the viewport change.

<div class="example-map">
  <iframe
    id="guides-widgets-advanced-step-6"
    src="/developers/carto-vl/examples/maps/guides/build-custom-charts/step-6.html"
    width="100%"
    height="550"
    style="margin: 20px auto !important"
    frameBorder="0">
  </iframe>
</div>
You can explore this step [here](/developers/carto-vl/examples/maps/guides/build-custom-charts/step-6.html)
