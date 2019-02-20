## Add widgets

[Widgets](https://carto.com/help/glossary/#widget) provide additional information about a dataset that is not symbolized on a map to facilitate understanding and exploration. On an election map, you can style the map by the winner, but also provide additional information from the data, for example, how many total votes did each party receive? Or, how many people voted?

The first thing you need to know to create widgets is the concept of [variables](/developers/carto-vl/guides/Glossary/#variables). A variable is a name in a CARTO VL visualization that has an expression bound to it. It's simply a way to name expressions to be referenced later. For example, let's say there was a magic function that returned our widget information like `myWidgetExpression()`, how do we actually get that information?

Firstly, we'll need to bind that expression to a new name so our visualization could be created like this:

```js
const myViz = new carto.Viz(`
    color: red
    width: 7

    @myVariable: myWidgetExpression()
`);
```

Then, we'll need to ask for the value of the expression when needed. Since our widget expression may change its value dynamically, for example, due to panning or filtering we should probably read it each time its layer is changed:

```js
myLayer.on('updated', ()=>{
    const myWidgetData = myViz.variables.myVariable.value;
    updateMyWidget(myWidgetData);
})
```

If, however, `myWidgetExpression` was static, we could just use `myLayer.on('loaded', ()=>{...});`.

### Scalars: what is the total of ...? what is the average of ...? what is the maximum ...?

#### What is the average price in the entire dataset?

To get the average of a property in the entire dataset we'll need to use the [`globalAvg()`](/developers/carto-vl/reference/#cartoexpressionsglobalavg) expression.

There are similar expressions for getting the minimum, the maximum, the sum, and percentiles.

#### What is the average price in the features shown?

There are similar functions that only take the features on the screen into account. For example, see [viewportAvg](/developers/carto-vl/reference/#cartoexpressionsviewportavg).

All the _viewport*_ like expressions will take only the features that are on the viewport region and that pass the filter set in the `filter:` visualization property.

You can see all together on this example:

<div class="example-map">
    <iframe
        id="guides-widgets-step-1"
        src="/developers/carto-vl/examples/maps/guides/add-widgets/step-1.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>

### Histograms: distribution of data

CARTO VL provides access to the necessary data for creating histograms. However, it is not trivial to create beautiful histograms on the screens.

To overcome this, we are going to use [Airship](https://carto.com/airship/), a design library for building Location Intelligence applications. You may want to read [Airship documentation](/developers/airship/) too since this guide will only show the basics for making histograms with CARTO VL and Airship, but Airship provides much more functionality than this.

The first thing you'll need is to include Airship with:
```html
<!-- Airship -->
<link rel="stylesheet" href="https://libs.cartocdn.com/airship-style/v1.0.3/airship.css">
<link rel="stylesheet" href="https://libs.cartocdn.com/airship-icons/v1.0.3/icons.css">
<script src="https://libs.cartocdn.com/airship-components/v1.0.3/airship.js"></script>
```

### Numeric histograms: what is the distribution of the price?

After including Airship, we'll need to add the HTML tags to place our histogram:
```html
 <aside class="toolbox">
        <div class="box">
            <header>
                <h1>Damage distribution</h1>
            </header>
            <as-histogram-widget />
            <footer class="js-footer"></footer>
        </div>
 </aside>
```

After that, we'll need to make sure to tell CARTO VL to process a histogram as a part of the visualization:
```js
const viz = new carto.Viz(`
    // The rest of the style should go here too
    @histogram: viewportHistogram($total_damage, 6)
`);
```
The [`viewportHistogram`](/developers/carto-vl/reference/#cartoexpressionsviewporthistogram) function accepts up to 3 parameters. The first parameter is the numeric expression that will be used to produce the histogram, this is usually your property.

The second parameter is the number of buckets of the histogram, by default it has a value of 20, we'll use a different value here.

The third parameter is optional, defaults to `1` and it is a way to weight each feature differently. For this case, we want to see the distribution of damage for each accident, without weighting each accident, but we could weight for example by the train size.

The last step is to connect CARTO VL data with the Airship *as-histogram-widget* component. We do this with:
```js
layer.on('updated', drawHistogram);

function drawHistogram() {
    var histogramWidget = document.querySelector('as-histogram-widget');
    const histogram = layer.viz.variables.histogram.value;
    histogramWidget.data = histogram.map(entry => {
        return {
            start: entry.x[0] / 1e6,
            end: entry.x[1] / 1e6,
            value: Math.log(entry.y + 1)
        }
    });
}
```

If you are curious about the usage of `Math.log`, this is done because the dataset has an exponential-like distribution that makes the histogram unusable without using a logarithmic scale.

Let's see the full example!

<div class="example-map">
    <iframe
        id="guides-widgets-step-2"
        src="/developers/carto-vl/examples/maps/guides/add-widgets/step-2.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>

##### Categorical histograms: how many votes did each party receive?

To make a category histogram or widget the steps are similar.

The Airship component is now *as-category-widget*:
```html
    <aside class="toolbox">
        <div class="box">
            <header>
                <h1>Accident type</h1>
            </header>
            <as-category-widget />
            <footer class="js-footer"></footer>
        </div>
    </aside>
```

The CARTO VL visualization can be simplified:
```js
const viz = new carto.Viz(`
    @histogram: viewportHistogram($total_damage, 1, 6)
`);
```

And the connection between Airship and CARTO VL needs a small adjustment:
```js
layer.on('updated', drawHistogram);

function drawHistogram() {
    var histogramWidget = document.querySelector('as-category-widget');
    const histogram = layer.viz.variables.histogram.value;
    histogramWidget.categories = histogram.map(entry => {
        return {
            name: entry.x,
            value: entry.y
        }
    });
}
```

<div class="example-map">
    <iframe
        id="guides-widgets-step-3"
        src="/developers/carto-vl/examples/maps/guides/add-widgets/step-3.html"
        width="100%"
        height="800"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
You can explore the final step [here](/developers/carto-vl/examples/maps/guides/add-widgets/step-3.html)
