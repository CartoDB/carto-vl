## Legends and Widgets

Maps that symbolize data without the necessary information to decode the symbols are not always effective in communicating their message. In this guide, you will explore two ways to enrich your visualizations with this information using _legends_ and _widgets_.

- **Legends**: aid interpretation by providing a visual explanation of point, line, or polygon symbols used on a map with a brief description of what they represent. For example, legends help answer questions like: is the conservative party colored red or blue? or which property and value are represented by the size of each circle?
- **Widgets**: provide additional pieces of information that accompany a map to facilitate understanding and exploration. Widgets often provide additional information about a dataset that is not symbolized on a map itself. For example, on a election map, you can style the map by winner, but also provide addtional information from the data. For example, how many total votes did each party receive? or how many people voted?

### Legends

CARTO VL itself doesn't provide the functionality to _draw_ legends. Instead, it provides the functionality necessary to _build_ them. What this means is that CARTO VL provides the data you need to create a legend, but drawing that data on the screen (in the form of a legend), is the responsibility of the application developer. The benefit of this is that you have more control over customizing legends for the needs of your specific application. With that in mind, this guide provides a series of examples that are meant to serve as legend "building blocks" that you can take and begin to customize on top of. 

There are two different ways to create legends with CARTO VL: the advanced `eval()` method and the more user-friendly [`getLegendData()`](https://carto.com/developers/carto-vl/reference/#expressionsrampgetlegenddata) method. This guide,covers the `getLegendData()` method. 

By the end of this section, you will better understand how to add a legend for point data symbolized by category. You will also learn how to modify the legend based on which styling property is used.

To access the `getLegendData()` method you need to reference the `ramp` expression. If the `ramp` expression is the root expression of a styling property, like `color`,`width`,`strokeColor`, or `strokeWidth`, it can be accessed directly with `layer.viz.color.getLegendData()`. Otherwise, you will need to use a variable, which we will explore in the [Widgets section](##_Widgets).



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

To get the average of a property in the entire dataset we'll need to use the [`globalAvg()`](/carto-vl/reference/#cartoexpressionsglobalavg) expression.

There are similar expressions for getting the minimum, the maximum, the sum, and percentiles.

##### What is the average price in the features shown?

There are similar functions that only take the features on the screen into account. For example, see [viewportAvg](/carto-vl/reference/#cartoexpressionsviewportavg).

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

To overcome this, we are going to use [Airship](https://carto.com/airship/), a design library for building Location Intelligence applications. You may want to read its [documentation](/airship/) too since this guide will only show the basics for making histograms with CARTO VL and Airship, but Airship provides much more functionality than this.

The first thing you'll need is to include Airship with:
```html
<!-- Airship -->
<link rel="stylesheet" href="https://libs.cartocdn.com/airship-style/v1.0.0-beta.0/airship.css">
<script src="https://libs.cartocdn.com/airship-components/v1.0.0-beta.0/airship.js"></script>
```

##### Numeric histograms: what is the distribution of the price?

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
    @histogram: viewportHistogram($total_damage, 1, 6)
`);
```
The [`viewportHistogram`](/carto-vl/reference/#cartoexpressionsviewporthistogram) function accepts up to 3 parameters. The first parameter is the numeric expression that will be used to produce the histogram, this is usually your property.

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
        id="accidents-category-histogram"
        src="/developers/carto-vl/examples/maps/guides/ramp/accidents-category-histogram.html"
        width="100%"
        height="800"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples#example-railroad-accidents---category-widget">View my source code!</a>
