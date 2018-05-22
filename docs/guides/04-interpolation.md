# Interpolation

Interpolation is the process of estimating an unknown value from two known values. This estimation can be controlled by weighting each original value differently. 

For example, in real life we usually mix cold and hot water to get warm water, and in many cases we don’t want an equal share of cold and hot water: we may choose to have 70% hot water and 30% cold water. This distributing factor is the third and last input of an interpolation.

## Use Cases

In data visualization, interpolation is traditionally used for two basic purposes: interpolating between symbol sizes and interpolating between colors. Interpolation is useful for exploratory analysis of continuous data. It has the potential to uncover insights that may otherwise be hidden using classification methods, like quantiles or equal intervals, that group values into a predefined number of buckets. Using interpolation, the entire range of values are mapped to a color, size, or other visual variable providing a "raw" visualization of the data that minimize the effects of generalization.

Using CARTO VL, you can interpolate both color and size, while also taking advantage of these capabilities for powerful web based, multi-scale cartography. 

#### Interpolating Color

We will start by creating a map where each point's area is proportionate to its attribute value (`amount`) using the square root (`sqrt`) function. 

```
width: sqrt($amount)
```
[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/interpolation/step-0.html)

In order to avoid symbols that are visually too large or too small, there are times when multiplying by a constant is recommended. For example, the styling above could be modified to `width: 0.5*sqrt($amount)` essentially cutting the symbol size in half.

In addition to sizing each symbol proportionate to `amount`, we can also assign a color to each symbol based on a range of values. Below, the `ramp` expression takes an input, in this case the `amount` from the range `[10, 1000]` € and maps it to an output, in this case the [CARTOColor](https://carto.com/carto-colors/) scheme *emrld*.

```
width: sqrt($amount)
color: ramp(linear($amount, 10, 1000), emrld)
strokeWidth: 0
```

[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/interpolation/step-1.html)

### Interpolating Size Through Zoom

Using CartoCSS powered renderers, you can write conditional styling to change the appearance of features through zoom. However, a limitation of these renderers is that they lack smooth transitions between each zoom-based style. CARTO VL's interpolation capabilities enable us to combinie multiple styles for different zoom levels with smooth transitions.

The example below demonstrates how to use CARTO VL to create a map with zoom-based styles using interpolation.

#### Example

Following the previous example, we may want to fix the width on 1 pixel on low zoom levels, yet keep the bubble-map on high zoom levels:

```
width: blend(1, sqrt($amount), linear(zoom(), 2^10, 2^14))
color: ramp(linear($amount, 10, 1000), emrld)
strokeWidth: 0
```

Here, we are telling CARTO VL to use a symbol size of 1 for zoom levels less than 10, and at zooms greater than 14 to transition to the original symbol size expression in the previous example. At intermediate zoom levels, CARTO VL's interpolation will blend between 1 and the symbol size expression.

[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/interpolation/step-2.html)
