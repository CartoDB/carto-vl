## Legends

Maps that symbolize data without the necessary information to decode the symbols are not always effective in communicating their message. In this guide, you will explore how to enrich your visualizations with **legends** to aid interpretation by providing a visual explanation of point, line, or polygon symbols used on a map with a description of what they represent. 

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

If you completed the XXX guide, this map will look familiar. In that guide, you learned how to symbolize feature properties with a `ramp`. In this guide, you will build upon that and see how to reference that `ramp` to access data for the legend. 

This guide also provides a series of examples, at the end, that are meant to serve as legend "building blocks" that you can take and begin to customize on top of for a variety of map types.

### Getting Started

Get started by copying the code for this map and save it as `accidents.html`:

<div class="example-map" style="margin: 20px auto !important">
    <iframe
        id="population-density-buckets-numeric"
        src="/developers/carto-vl/examples/maps/guides/legends/accidents-all-no-legend.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples#example-accidents-all---no-legend">Copy my source code!</a>

This is a category map that symbolizes US rail accidents by reported weather conditions. When you open the file in a web browser, you will notice that the map has a legend box with a title ("Rail Accidents by Weather") in the right hand corner. 

What is missing is a legend to interpret what weather type each color on the map represents. Let's see how to add that content.

### Access data from `ramp`

To get the necessary information to populate the legend, you use the [`getLegendData()`](https://carto.com/developers/carto-vl/reference/#expressionsrampgetlegenddata) method. The `getLegendData()` method needs to reference the `ramp` expression where the symbology for your map is defined. 

Take a look at the point styling for the accidents map. This is the styling that we want to bring into our legend and associate each legend item to each category type that we are symbolizing from the `$weather` property.

```CARTO_VL_Viz
const viz = new carto.Viz(`
    width: 7
    color: ramp($weather,[darkorange,darkviolet,darkturquoise])
    strokeWidth: 0.2
    strokeColor: black 
`);
```

### Get legend data

Since the `ramp` expression is the root expression of a styling property (in this case, `color`) it can be accessed directly with `layer.viz.color.getLegendData()`. If it is not tied directly to a styling property, you will need to use a variable. We will explore that method in detail in the [Add Widgets](##_Widgets) guide.

Add the following code to your map right under `layer.addTo(map)` and before the closing `</script>` tag. Take a look through the inline comments describing the different steps to place the legend content when a map is loaded. 

```js
//** ADD LEGEND **//

// When layer loads, trigger legend event
layer.on('loaded', () => {
    
    // Request data for legend from the layer viz
    const colorLegend = layer.viz.color.getLegendData();
    let colorLegendList = '';
    
    // A function to convert map colors to HEX values for legend
    function rgbToHex(color) {
        return "#" + ((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1);
    }
    
    // Create list elements for legend
    colorLegend.data.forEach((legend, index) => {
        const color = rgbToHex(legend.value);
        
        // Style for legend items
        colorLegendList +=
            `<li><span class="point-mark" style="background-color:${color};border: 1px solid black;"></span> <span>${legend.key}</span></li>\n`;
    });
    
    // Place list items in the content section of the title/legend box
    document.getElementById('content').innerHTML = colorLegendList;
});
```

### Place legend data

If you load your map after this step, you will see that there is still no legend content! That's because we have to define a place for the last step of the process (`document.getElementById('content').innerHTML = colorLegendList;`) to place the information on the map once it is received. 

<div class="example-map" style="margin: 20px auto !important">
    <iframe
        id="population-density-buckets-numeric"
        src="/developers/carto-vl/examples/maps/guides/legends/accidents-all-no-content.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

To define where the content should be placed on the map, add a `<section>` in the title/legend box element of the page:

```html
<!-- Add title/legend box -->
<aside class="toolbox">
    <div class="box">
        <header>
            <h1>Rail Accidents by Weather</h1>
        </header>
        <!-- Add legend data -->
        <section>
            <div id="controls">
                <ul id="content"></ul>
            </div>
        </section>
    </div>
</aside>
```
Now, when you load the map, you will see the complete legend. You will also notice that the CARTO VL interpolated `ramp` colors (we only provided three colors for six categories) are also brought into the legend with the associated category name.

<div class="example-map" style="margin: 20px auto !important">
    <iframe
        id="accidents-all"
        src="/developers/carto-vl/examples/maps/guides/legends/accidents-all-legend.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples#example-accidents-all---legend">View my source code!</a>

### Overwrite defaults

In the map above, we are symbolizing all six weather categories in the data and therefore have an entry for each type in the legend. There are other times when there is symbology applied to some categories but not all of them. In this case, you will have an "others" legend item.

For example, the map below symbolizes only the `top` three weather conditions in the rail accident data. The legend labels the top three categories with all other categories labeled as `CARTO_VL_OTHERS`:

<div class="example-map" style="margin: 20px auto !important">
    <iframe
        id="accidents-all"
        src="/developers/carto-vl/examples/maps/guides/legends/accidents-all-top-others-legend.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

You can overwrite this default label in the style for the `colorLegendList` with `${legend.key.replace()`:

```js
// Style for legend items based on geometry type
colorLegendList +=
    `<li><span class="point-mark" style="background-color:${color}; border: 1px solid black;"></span><span>${legend.key.replace('CARTO_VL_OTHERS', 'Other weather')}</span></li>\n`;
```

With that change, the final map will now label other categories as "Other weather" in the legend:

<div class="example-map" style="margin: 20px auto !important">
    <iframe
        id="accidents-all"
        src="/developers/carto-vl/examples/maps/guides/legends/accidents-all-top-legend.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples#example-accidents-all---top-legend">View my source code!</a>












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

