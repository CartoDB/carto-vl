## Add widgets advanced

We have seen how to add legends to our map by using `getLegendsData` method, and we have also learned how to display widgets using histogram expressions in the [previous guide](/developers/carto-vl/guides/add-widgets/). This is an advanced guide to learn how to obtain and display the information in widgets by using `viewportHistogram` and `globalHistogram` expressions.

### Overview

We will learn how to create bar charts for **categorical** data and histograms for **numeric** data. For this purpose, the following examples make use of the same source, the [**Vancouver Trees**](https://team.carto.com/u/cartovl/tables/cartovl.vancouver_trees/public/map) dataset.

Bar charts and histograms have been built with [Chart.js](https://www.chartjs.org), a very simple external library. In the previous guide we used [Airship](https://carto.com/airship/) to build a histogram widget. In this case, we want to demonstrate you can use the visualization library of your choice with CARTO VL, and therefore, we have to explain how the histogram expressions work a bit deeply.

### Histogram expressions

There are two histogram expressions in CARTO VL: `viewportHistogram` and `globalHistogram`. These expressions return a list of values grouped by column. The `viewportHistogram` returns the list based on the features that are visible in the viewport, while `globalHistogram` takes into account the whole dataset.

#### Drawing a bar chart

In this first step, we are going to draw a bar chart showing the number of trees classified by **street side**. We are going to use the `viewportHistogram` expression.

```js
  // Define the source
  const source = new carto.source.Dataset('vancouver_trees');

  // Define the visualization
  const viz = new carto.Viz(`
    @v_histogram: viewportHistogram($street_side_name)
  `);
```

Char.js library needs three arrays to draw the bar chart:

* `labels`: array of string values that indicate the label of each bar.
* `data`: array of numeric values that indicate the height of each bar.
* `backgroundColor`: array of colors that will be applied to the chart bars from left to right. If you assign a single color, all the chart bars will be colored the same.

We are going to use this configuration by default:

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
      barPercentage: 1.0,
      categoryPercentage: 1.0
    }]
  }
};

const chart = new Chart(ctx, {
  type: 'bar',
  options: chartOptionsDefault
});
```

The `histogram.value` returns an array of `{ x, y }` objects where `x` is the name of the category and `y` is the amount of trees for this category. We are going to build `data` and `labels` arrays from the histogram expression  **once the layer is updated**:

```js
layer.on('updated', () => {
  // Get histogram data
  const histogramData = layer.viz.variables.v_histogram.value;

  // Chart.js set up
  const labels = histogramData.map(elem => elem.x);
  const data = histogramData.map(elem => elem.y);
  const backgroundColor = ['#00718b', '#089099', '#46aea0', '#7ccba2', '#f7feae'];

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

Here you can see the result. Check how the bars change when you interact with the map.

<div class="example-map">
  <iframe
    id="guides-widgets-advanced-step-1"
    src="/developers/carto-vl/examples/maps/guides/add-widgets-advanced/step-1.html"
    width="100%"
    height="550"
    style="margin: 20px auto !important"
    frameBorder="0">
  </iframe>
</div>
You can explore this step [here](/developers/carto-vl/examples/maps/guides/add-widgets-advanced/step-1.html)

#### Drawing a histogram

Now, let's build a histogram showing the information of the **trees diameter**. The diameter is a **numeric** value, and we are going to classify the diameters in six buckets as follows:

```js
const viz = new carto.Viz(`
  @v_histogram: viewportHistogram($diameter, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]])
`);
```

In this case, we will create a histogram with six bars based on the viewport features.

<div class="example-map">
  <iframe
    id="guides-widgets-advanced-step-2"
    src="/developers/carto-vl/examples/maps/guides/add-widgets-advanced/step-2.html"
    width="100%"
    height="550"
    style="margin: 20px auto !important"
    frameBorder="0">
  </iframe>
</div>
You can explore this step [here](/developers/carto-vl/examples/maps/guides/add-widgets-advanced/step-2.html)

#### viewportHistogram vs globalHistogram

We can combine both `viewportHistogram` and the `globalHistogram` expressions to compare viewport vs global features. If you interact with the map, you'll see how the bars from the globalHistogram remain static, while the ones from the viewportHistogram change depending on the features present in the viewport.

<div class="example-map">
  <iframe
    id="guides-widgets-advanced-step-3"
    src="/developers/carto-vl/examples/maps/guides/add-widgets-advanced/step-3.html"
    width="100%"
    height="550"
    style="margin: 20px auto !important"
    frameBorder="0">
  </iframe>
</div>
You can explore this step [here](/developers/carto-vl/examples/maps/guides/add-widgets-advanced/step-3.html)

#### Using `top()`

It is possible to use the `top` expression in the histograms expressions. Right now, this is the **only expression** we allow in the histograms. In this case, we want to get the **top five** tree species, so we have to create the following viz:

```js
const viz = new carto.Viz(`
  @v_histogram: viewportHistogram(top($species_name, 5))
`);
```

<div class="example-map">
  <iframe
    id="guides-widgets-advanced-step-4"
    src="/developers/carto-vl/examples/maps/guides/add-widgets-advanced/step-4.html"
    width="100%"
    height="550"
    style="margin: 20px auto !important"
    frameBorder="0">
  </iframe>
</div>
You can explore this step [here](/developers/carto-vl/examples/maps/guides/add-widgets-advanced/step-4.html)

#### `getJoinedValues`

What if we want create a bar chart, where each color corresponds with its features in the map? First of all, we will need a `ramp` expression to color the map. This expression comes with the [`getLegendData()`](/developers/carto-vl/reference/#expressionsrampgetlegenddata) method we explained in the [Add legends](/developers/carto-vl/guides/add-legends/) guide.

Both `viewportHistogram` and `globalHistogram` expressions have the [`getLegendData()`](/developers/carto-vl/reference/#expressionsviewporthistogramgetjoinedvalues) method. Let's first define the Viz:

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

const labels = histogramData.map(elem => elem.key);
const data = histogramData.map(elem => elem.frequency);
const colors = histogramData.map(elem => elem.value);
```

It is important to take into account that `getJoinedValues` returns an array of `{ key, value, frequency }` elements sorted by frequency. In this case, the value contains a **color** because it is a **color ramp**. Take a look at the result:

<div class="example-map">
  <iframe
    id="guides-widgets-advanced-step-5"
    src="/developers/carto-vl/examples/maps/guides/add-widgets-advanced/step-5.html"
    width="100%"
    height="550"
    style="margin: 20px auto !important"
    frameBorder="0">
  </iframe>
</div>
You can explore this step [here](/developers/carto-vl/examples/maps/guides/add-widgets-advanced/step-5.html)

But, what if we are using a `top` expression? How should we tell the bar chart which color do we need and to display only the five top categories? The answer is that we should use the **same operation** in the ramp and in the histogram. If we use the `top` in the histogram, then we have to use the `top` in the ramp as well.

```js
const viz = new carto.Viz(`
  @v_color: ramp(top($species_name, 5), Vivid)
  @v_histogram: viewportHistogram(top($species_name, 5))
  color: @v_color
`);
```

And, refactoring a bit the visualization to share that expression in a variable, we have the equivalent:

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
  othersLabel: 'Other species'
};
const colorValues = color.getLegendData(options);
// Get histogram data
const histogramData = histogram.getJoinedValues(colorValues.data, options);

const labels = histogramData.map(elem => elem.key);
const data = histogramData.map(elem => elem.frequency);
const colors = histogramData.map(elem => elem.value);
```

<div class="example-map">
  <iframe
    id="guides-widgets-advanced-step-6"
    src="/developers/carto-vl/examples/maps/guides/add-widgets-advanced/step-6.html"
    width="100%"
    height="550"
    style="margin: 20px auto !important"
    frameBorder="0">
  </iframe>
</div>
You can explore this step [here](/developers/carto-vl/examples/maps/guides/add-widgets-advanced/step-6.html)
