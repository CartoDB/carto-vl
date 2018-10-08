# Widgets and Legends

Most of the times, displaying data in a map without further information is meaningless. Here, we'll see two ways to enrich visualizations: widgets and legends.
- Legends. Legends don't provide additional information, instead, they provide information about how information was displayed on the map: was the conservative party colored red or blue? or, in a bubble-map, which property is displayed by the size of each circle, and in which manner.
- Widgets. A widget is an additional piece of information that accompanies the map and that provides additional information. For example, in an election map, we are probably interested on the global results of the election: how many votes did receive each party in total? how many people voted?

## Legends

In the data driven visualization guide we had displayed multiple legends to better understand other concepts, but we didn't talked about the legends themselves.

CARTO VL provides some facilities to create legends: the advanced `eval()` method, which won't be covered by this guide, and the user friendly `getLegendData()` method, which is what we will use here.

However, in any case, CARTO VL itself doesn't provide functionality to display legends, it provides functionality to built them upon them. CARTO VL provides the necessary data to create the legends, but using that data to draw the legends on the screen is left as a responsibility of the developer. The reason for this is that in this way, you'll be able to customize much more your application.

With that said, we provide some examples of this, so you can base your own legends on CARTO VL examples. Here, we'll explain both: the CARTO VL legend API and the reference examples that use such API.

### Unclassified numerical data
http://127.0.0.1:8080/examples/misc/legends/legend-number.html

### Categorical data

legend-buckets.html

#### Showing images
http://127.0.0.1:8080/examples/misc/legends/legend-image.html


## Widgets

The first you need to know to create widgets is the concept of [variables](). A variable is a name in a CARTO VL visualization that has an expression bound to it. It's simply a way to name expressions to be referenced later. For example, let's say there was a magic function that returned our widget information like `myAwesomeWidgetExpression()`, how do we actually get that information?

Firstly, we'll need to bind that expression to a new name, so our visualization could be created like this:
```Javascript
const myViz = new carto.Viz(`
    color: red
    width: 7

    @myAwesomeVariable: myAwesomeWidgetExpression()
`);
```

Then, we'll need to ask for the value of the expression when needed. Since our awesome widget expression may change its value dynamically, for example, due to panning or filtering we should probably read it each time its layer is changed:
```Javascript
myLayer.on('updated', ()=>{
    const myWidgetData = myViz.variables.myAwesomeVariable.value;
    updateMyAwesomeWidget(myWidgetData);
})
```

If, however, myAwesomeWidgetExpression was static, we could just use `myLayer.on('loaded', ()=>{...});`.

### Scalars: what is total of ...? what is the average of ...? what is the maximum ...?

TODO example

#### What is the average price in the entire dataset?

To get the average of a property in the entire dataset we'll need to use the [`globalAvg()`](https://carto.com/developers/carto-vl/reference/#cartoexpressionsglobalavg) expression.

There are similar expressions for getting the minimum, the maximum, the sum, and percentiles.

#### What is the average price in the features shown?

There are similar functions that only take the features on the screen into account. For example, see [viewportAvg](https://carto.com/developers/carto-vl/reference/#cartoexpressionsviewportavg).

All the _viewport*_ like expressions will take only the features that are on the viewport region and that pass the filter set in the `filter:` visualization property.

#### Histograms: distribution of data

#### Numeric histograms: what is the distribution of the price?
http://127.0.0.1:8080/examples/misc/legends/legend-numeric-chart.html

#### Categorical histograms: how many votes did each party receive?
http://127.0.0.1:8080/examples/misc/legends/legend-categorical-chart.html
