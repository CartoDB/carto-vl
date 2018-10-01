# Styling your visualization using Expressions

CARTO VL styling is based on the concept of visualizations. A visualization is a set of styling properties and variables with assigned expressions. Visualizations allow you to control from the color of the features to the available properties on interactivity events.

## Styling properties
Visualizations have a fixed set of styling properties like `color` or `width`. In contrast with cascading languages like CSS and CSS-derived languages, CARTO VL styling properties cannot be redefined based on selectors. Instead, CARTO VL expressions like `ramp` are used to select the expected values based on some input (the selector).

This is a comparison between both approaches to get the gist of it, it's ok if you don't fully understand them since we'll cover this in depth later in the data-driven visualization guide.

```CartoCSS
// CSS-derived language (NOT a CARTO VL valid visualization)

// We use a selector
[price < 100] {
  // We set the width if the feature match with the previous selector
  marker-width: 5
}

// Selector for the other case
[price >= 100] {
  // We set the width for this other case, redefining the width
  marker-width: 15
}
```

```CARTO_VL_Viz
// CARTO VL valid visualization
// The buckets expression will classify the input property in two buckets: features with prices less than 100, and features with prices larger or equal than 100
// The ramp expression will assign 5 to the first bucket and 15 to the second
// Finally, we'll use ramp's output as the width
width: ramp(buckets($price, [100]), [5, 15])
```

Another important difference that you can see on the previous comparison is the lack of the geometry type (like `marker` or `line`) when declaring the CARTO VL viz property. See the following example to see how the properties adapt automatically to the geometry type:

TODO
example with multiple dataset and styles like this:
- Point dataset:
  `
  // CARTO VL viz comments can be created by starting a line with `//`
  width: 10
  color: white
  strokeWidth: 2
  colorStroke: green
  `
- Line dataset:
`
// Lines don't have a stroke, so stroke-related properties are ignored
width: 10
color: white
strokeWidth: 2
colorStroke: green
`
- Polygon dataset:
`
  // Polygons don't have a `width`, only a `strokeWidth`. Therefore, the `width` property is ignored.
  width: 10
  color: white
  strokeWidth: 2
  colorStroke: green
`


The complete list of CARTO VL styling properties and their semantics can be seen [here](https://carto.com/developers/carto-vl/reference/#vizspec).


## What's an expression?

Expressions are constants like `red`, `#FFF` or `7` and functions like `sqrt`, `+`, or `ramp` that are used to assign values to styling properties. For example:
```CARTO_VL_Viz
width: 7+3
color: white
```

Expressions can be combined together by using expression functions. However, each function will impose limitations on the types of its input parameters. It's easier to look at it with some examples:
```CARTO_VL_Viz
// This won't work, the function `+` cannot work with a numeric parameter (7)
// and a color parameter (white)
width: 7+white
```
```CARTO_VL_Viz
// This won't work either, even though the `+` of `7` and `3` is valid
// It is not valid to assign a numeric expression to the styling property `color`
color: 7+3
```

Most type restrictions can be expected like the example above, it would have been surprising that adding a color with a number worked. But, it is not clear in other cases, you can look at the [reference](https://carto.com/developers/carto-vl/reference/) to see the complete list of types and the expected types of each function.

## Color expression basics

There are multiple ways to get color expressions (expressions with type color):
- **Color constants** are colors defined by its name (`red`, `blue`, `white`...) or by its RGB(A) composition (#F88, #F88A, #F08080, #F08080A0).
- **Color constructors** are functions that define colors by the components of its color space: `rgba(255, 255, 255, 0.6)`, `hsv(0, 1, 1)`.
- The **`opacity`** function, which overrides an input color alpha channel
- The **`ramp`** function, which will be introduced in the "Data Driven visualization" guide.
- Other advanced expressions like color arithmetic or blending

You can take a look at the reference for a detailed description of all color expressions.

### Transparency, alpha channel, opacity, and filtering

There are multiple ways to set the alpha channel:
- The alpha channel when using a color constant or color constructor. You should use this whenever you can (i.e., you want to change the alpha channel of a color constant or color constructor).
- Using `opacity` to override the alpha channel. You should use this when the input color expression is not a color constant or color constructor. For example, it is very common to combine `opacity` with `ramp`. For example: `opacity(ramp($price, prism), 0.5)
- Using the `filter` property. The filter property multiplies the color alpha channel(both fill and stroke) of the features with its value. This, however, has a special semantic regarding viewport aggregation expressions. We'll look at this later.


## Numeric expressions basics

