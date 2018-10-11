## Legends and Widgets

Most of the times, displaying data in a map without further information is meaningless. Here, we'll see two ways to enrich visualizations: legends and widgets.
- Legends. Legends don't provide additional information, instead, they provide information about how information was displayed on the map: was the conservative party colored red or blue? or, in a bubble-map, which property is displayed by the size of each circle, and in which manner.
- Widgets. A widget is an additional piece of information that accompanies the map and that provides information not necessarily present on the map. For example, in an election map, we are probably interested in the global results of the election: how many votes did receive each party in total? how many people voted?

### Legends

In the data-driven visualization guide we had displayed multiple legends to better understand other concepts, but we didn't talk about the legends themselves.

CARTO VL provides some facilities to create legends: the advanced `eval()` method, which won't be covered by this guide, and the user-friendly `getLegendData()` method, which is what we will use here.

However, in any case, CARTO VL itself doesn't provide functionality to display legends, it provides functionality to build them upon them. CARTO VL provides the necessary data to create the legends, but using that data to draw the legends on the screen is left as a responsibility of the developer. The reason for this is that in this way, you'll be able to customize much more your application.

With that said, we provide some examples of this so you can base your own legends on CARTO VL examples. Here, we'll explain both: the CARTO VL legend API and the reference examples that use such API.

To access the `getLegendData()` method you'll need a way to reference your `ramp` expression. If the `ramp` expression is the root expression of a styling property it can be accessed directly with `layer.viz.color.getLegendData()`. Otherwise, you'll need to use a variable, as explained in the [next subsection](##_Widgets).

#### Unclassified numerical data

<div class="example-map">
    <iframe
        id="legend-number"
        src="/developers/carto-vl/examples/maps/misc/legends/legend-number.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples/#example-legends---unclassified-numerical-data">View my source code!</a>


#### Categorical data

<div class="example-map">
    <iframe
        id="legend-buckets"
        src="/developers/carto-vl/examples/maps/misc/legends/legend-buckets.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples/#example-legends---categorical-data">View my source code!</a>

##### Showing images

<div class="example-map">
    <iframe
        id="legend-image"
        src="/developers/carto-vl/examples/maps/misc/legends/legend-image.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples/#example-multiple-images">View my source code!</a>

### Widgets

The first thing you need to know to create widgets is the concept of [variables](). A variable is a name in a CARTO VL visualization that has an expression bound to it. It's simply a way to name expressions to be referenced later. For example, let's say there was a magic function that returned our widget information like `myAwesomeWidgetExpression()`, how do we actually get that information?

Firstly, we'll need to bind that expression to a new name so our visualization could be created like this:

```js
const myViz = new carto.Viz(`
    color: red
    width: 7

    @myAwesomeVariable: myAwesomeWidgetExpression()
`);
```

Then, we'll need to ask for the value of the expression when needed. Since our awesome widget expression may change its value dynamically, for example, due to panning or filtering we should probably read it each time its layer is changed:

```js
myLayer.on('updated', ()=>{
    const myWidgetData = myViz.variables.myAwesomeVariable.value;
    updateMyAwesomeWidget(myWidgetData);
})
```

If, however, myAwesomeWidgetExpression was static, we could just use `myLayer.on('loaded', ()=>{...});`.

#### Scalars: what is the total of ...? what is the average of ...? what is the maximum ...?

##### What is the average price in the entire dataset?

To get the average of a property in the entire dataset we'll need to use the [`globalAvg()`](https://carto.com/developers/carto-vl/reference/#cartoexpressionsglobalavg) expression.

There are similar expressions for getting the minimum, the maximum, the sum, and percentiles.

##### What is the average price in the features shown?

There are similar functions that only take the features on the screen into account. For example, see [viewportAvg](https://carto.com/developers/carto-vl/reference/#cartoexpressionsviewportavg).

All the _viewport*_ like expressions will take only the features that are on the viewport region and that pass the filter set in the `filter:` visualization property.

You can see all together on this example:

<div class="example-map">
    <iframe
        id="accidents-widgets"
        src="/developers/carto-vl/examples/maps/guides/ramp/accidents-widgets.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples#example-railroad-accidents---widgets">View my source code!</a>

##### Histograms: distribution of data

CARTO VL provides access to the necessary data for creating histograms. However, it is not trivial to create beautiful histograms on the screens.

To overcome this, we are going to use [Airship](https://carto.com/airship/), a design library for building Location Intelligence applications. You may want to read its [documentation](https://carto.com/developers/airship/) too since this guide will only show the basics for making histograms with CARTO VL and Airship, but Airship provides much more functionality than this.

The first thing you'll need is to include Airship with:
```html
<!-- Airship -->
<link rel="stylesheet" href="https://libs.cartocdn.com/airship-style/v1.0.0-beta.0/airship.css">
<script src="https://libs.cartocdn.com/airship-components/v1.0.0-beta.0/airship.js"></script>
```

##### Numeric histograms: what is the distribution of the price?

After including Airship, we'll need to add the HTML tags to place our histogram:
```HTML
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
    @histogram: viewportHistogram($total_damage, 1, 6)
`);
```
The [`viewportHistogram`](https://carto.com/developers/carto-vl/reference/#cartoexpressionsviewporthistogram) function accepts up to 3 parameters. The first parameter is the numeric expression that will be used to produce the histogram, this is usually your property.

The second parameter is optional, defaults to `1` and it is a way to weight each feature differently. For this case, we want to see the distribution of damage for each accident, without weighting each accident, but we could weight for example by the train size.

The third parameter is the number of buckets of the histogram, by default it has a high value (1000), we'll simplify this a little bit here.

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
        id="accidents-numeric-histogram"
        src="/developers/carto-vl/examples/maps/guides/ramp/accidents-numeric-histogram.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples#example-railroad-accidents---numeric-histogram">View my source code!</a>

##### Categorical histograms: how many votes did each party receive?

To make a category histogram or widget the steps are similar.

The Airship component is now *<as-category-widget>*:
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
        id="accidents-category-histogram"
        src="/developers/carto-vl/examples/maps/guides/ramp/accidents-category-histogram.html"
        width="100%"
        height="800"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples#example-railroad-accidents---category-widget">View my source code!</a>
