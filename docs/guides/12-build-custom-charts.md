## Build custom charts

In the [Add legends](/developers/carto-vl/guides/add-legends/) guide, you saw how to add legends to a map using the `getLegendsData` method, and how to display widgets using histogram expressions in the [Add widgets](/developers/carto-vl/guides/add-widgets/) guide. In this guide, you will build upon those concepts and learn how to obtain and display information in widgets using the `viewportHistogram` and `sampleHistogram` expressions and an external charting library.

### Overview

In the [previous guide](/developers/carto-vl/guides/add-widgets/) histogram widgets were built with CARTO's frontend framework [Airship](https://carto.com/airship/). As explained there, Airship widgets interact with CARTO VL directly, which means widgets are automatically connected to the map and can be configured accordingly. This guide takes a deeper dive into histogram expressions and the flexibility in CARTO VL to connect with external libraries. You will learn how to use histogram expressions to create bar charts for **categorical** data and histograms for **numeric** data using a [Vancouver Trees](https://team.carto.com/u/cartovl/tables/cartovl.vancouver_trees/public/map) dataset with the external charting library, [Chart.js](https://www.chartjs.org).

### Histogram expressions

CARTO VL has two expressions to create histograms: `viewportHistogram` and `sampleHistogram`. Both expressions return a list of values grouped by a column but differ in the way values are grouped. The `viewportHistogram` expression returns a list based off of features that are in the viewport, while the `sampleHistogram` expression returns a list based on a data sample.

#### `viewportHistogram` vs `sampleHistogram`

The map below combines both `viewportHistogram` and `sampleHistogram` expressions to compare the information returned for viewport vs sample feature calculations. If you interact with the map, you'll see how the bars for `sampleHistogram` remain static, while the ones for `viewportHistogram` change depending on the features present in the viewport.

What you may notice is that if you zoom out, the `viewportHistogram` chart doesn't match the `sampleHistogram` chart. This is because the data returned for the `sampleHistogram`, as indicated by its name, is a **representative sample** of the data. Therefore, the results may vary since we're comparing the viewport data with a representative sample of the whole dataset. If you need higher accuracy, we recommend creating a [custom query](https://wiki.postgresql.org/wiki/Aggregate_Histogram) and use the [`carto.source.SQL`](/developers/carto-vl/reference/#cartosourcesql).

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

Once we've introduced the main difference between viewport and sample histogram, it's time to learn how to use these expressions to draw charts.

#### Draw a bar chart for categories

In this step, you will create a basic bar chart that displays the count of trees planted on each **street side** category (odd, even, middle) using the `viewportHistogram` expression.

To start, define the source dataset and create a variable (`@v_histogram`) in the viz that will return the count and category information for the chart:

```js
  // Define the source
  const source = new carto.source.Dataset('vancouver_trees');

  // Define the visualization
  const viz = new carto.Viz(`
    @v_histogram: viewportHistogram($street_side_name)
  `);
```

To draw a basic chart, start with a default configuration:

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

In order for Chart.js to draw the returned information as a bar chart, it needs three arrays of information:

* `labels`: array of string values that indicate the label of each bar.
* `data`: array of numeric values that indicate the height of each bar.
* `backgroundColor`: array of colors that will be applied to the chart bars from left to right. If you assign a single color, all the chart bars will be colored the same.

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

#### Draw a histogram for numbers

Next, let's take a look at building a histogram to show the distribution of a numeric value, **tree diameter**.  

For this case, the chart will have six histogram bars with the count of trees within each diameter range. To get this information, classify the diameter values into six buckets based on the viewport:

```js
const viz = new carto.Viz(`
  @v_histogram: viewportHistogram($diameter, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]])
`);
```

Similar to the map above, when interacting with resulting map, the histogram bars dynamically update and can be hovered for more detailed information:

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

In the map below, the chart displays counts of the number of features in each **species name** category using `top` inside of the histogram expression. In this case, we only want to display the **top five** tree species in the data in the histogram.

To do so, create the following viz:

```js
const viz = new carto.Viz(`
  @v_histogram: viewportHistogram(top($species_name, 5))
`);
```

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
Right now, `top` is the **only expression** available for use with histograms.

#### `getJoinedValues`

In all of the examples above, you will notice that the bar colors are a solid, default color that was defined in the default chart properties. But what if you want to create a bar chart, and assign colors to each bar that correspond with the associated features on the map? To do this, first, you need a `ramp` expression to color map features which is part of the [`getLegendData()`](/developers/carto-vl/reference/#expressionsrampgetlegenddata) method covered in the [Add legends](/developers/carto-vl/guides/add-legends/) guide.

Both `viewportHistogram` and `sampleHistogram` expressions have the [`getJoinedValues()`](/developers/carto-vl/reference/#expressionsviewporthistogramgetjoinedvalues) method.

Let's first define the viz:

```js
const viz = new carto.Viz(`
  @v_color: ramp($species_name, Vivid)
  @v_histogram: viewportHistogram($species_name)
  color: @v_color
`);
```

And then, use the `@v_color` and `@v_histogram` variables to access to the `getLegendData` and `getJoinedValues` methods respectively:

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
* value: The value asigned to the data from the ramp

We can use these properties to build the Chart bars. We get the labels from the `key` property, the data from the `frequency`, and the colors from the `value`:

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

But, what if we are using a `top` expression? How can we tell the bar chart which colors we need to display only the five top categories? The answer is that we should use the **same operation** in the ramp and in the histogram. If we use `top` in the histogram, then we have to use `top` in the ramp as well:

```js
const viz = new carto.Viz(`
  @v_color: ramp(top($species_name, 5), Vivid)
  @v_histogram: viewportHistogram(top($species_name, 5))
  color: @v_color
`);
```

By refactoring the visualization a bit, to share that expression in a variable, we have the equivalent:

```js
const viz = new carto.Viz(`
  @top_five: top($species_name, 5)
  @v_color: ramp(@top_five, Vivid)
  @v_histogram: viewportHistogram(@top_five)
  color: @v_color
`);
```

However, there is something else these methods have in common. By default, the `top` classifies the ones that are not the _top_ ones as **'others'**. In CARTO VL, this value is labeled with `CARTO_VL_OTHERS` by default. We can override it by passing an `options` object with `othersLabel`. But if we do so, we have to use the **same options** in both methods:

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
