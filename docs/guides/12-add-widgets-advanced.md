## Add widgets advanced

We have seen how to add legends to our map by using `getLegendsData` method, and we have also learned to display widgets. This is an advanced guide to learn how to enrich the information in the widgets by combining different expressions and methods.

### Overview

For this case, we are going to use the same source, the **Vancouver Trees** dataset. We will learn how to create bar charts for categorical data and histograms for numeric data.

All the charts in this guide have been built with [Chart.js](https://www.chartjs.org), a very simple external library, to demonstrate you can use the visualization library of your choice with CARTO VL. In this case, we will use this configuration:

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

### Histogram expressions

There are two histogram expressions in CARTO VL: `viewportHistogram` and `globalHistogram`. These expressions return a list of values grouped by column. The `viewportHistogram` return this list based on the features visible in the viewport, while `globalHistogram` takes into account the whole dataset.

In this first step, we are going to draw a bar chart showing the number of trees classified by **street side**. We are going to use the `viewportHistogram` expression and check how the bars change when we interact with the map.

```js
  // Define the source
  const source = new carto.source.Dataset('vancouver_trees');

  // Define the visualization
  const viz = new carto.Viz(`
    @v_histogram: viewportHistogram($street_side_name)
    width: 5
    strokeWidth: 0
  `);
```

Char.js library needs three arrays to draw the bar chart:

* `labels`: array of string values: that indicates the label of each bar.
* `data`: array of numeric values that indicates the height of each bar.
* `backgroundColor`: array of colors: to color the bars from left to right. All the bars will have the same color if there is only one element.

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

<div class="example-map">
    <iframe
        id="guides-widgets-advanced-step-1"
        src="/developers/carto-vl/examples/maps/guides/add-widgets-advanced/step-1.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
You can explore this step [here](/developers/carto-vl/examples/maps/guides/add-widgets-advanced/step-1.html)

Now, let's build a histogram showing the information of the trees diameter.

#### Using classifiers

### `getJoinedValues`
