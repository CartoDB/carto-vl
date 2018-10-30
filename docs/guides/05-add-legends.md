## Legends

Maps that symbolize data without the necessary information to decode the symbols are not always effective in communicating their message. In this guide, you will explore how to enrich your visualizations with **legends** to aid interpretation by providing a visual explanation of point, line, or polygon symbols used on a map with a brief description of what they represent. 

### Overview

CARTO VL itself doesn't provide the functionality to _draw_ legends. Instead, it provides the functionality necessary to _build_ them. What this means is that CARTO VL provides the data you need to create a legend, but drawing that data on the screen (in the form of a legend), is the responsibility of the application developer. The benefit of this is that you have more control over customizing legends for the needs of your specific application. 

By the end of this guide, you will better understand how to add a legend for data symbolized by category:

<div class="example-map" style="margin: 20px auto !important">
    <iframe
        id="accidents-all"
        src="/developers/carto-vl/examples/maps/guides/legends/accidents-all-legend.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

If you completed the XXX guide, this map will look familiar. In that guide, you learned how to symbolize feature properties with a `ramp`. In this guide, you will build upon that and see how to reference the `ramp` expression to access data for the legend. We also provide a series of examples at the end of the guide that are meant to serve as legend "building blocks" that you can take and begin to customize on top of for a variety of map types.

### Getting Started

Get started by <a href="/developers/carto-vl/examples#example-accidents-all---no-legend">copying this code</a>, a category map that symbolizes US rail accidents by reported weather conditions and save it as `accidents.html`.

When you open it in a web browser, you will notice that the map has a legend box with a title in the right hand corner. There is a title for the map, but no indication of what weather type each color on the map represents.



If the `ramp` expression is the root expression of a styling property, (like `color`,`width`,`strokeColor`, or `strokeWidth`), it can be accessed directly with `layer.viz.color.getLegendData()`. Otherwise, you will need to use a variable, which we will explore in the [Widgets section](##_Widgets).

There are two different ways to create legends with CARTO VL: the advanced `eval()` method and the more user-friendly [`getLegendData()`](https://carto.com/developers/carto-vl/reference/#expressionsrampgetlegenddata) method. This guide,covers the `getLegendData()` method. 

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

