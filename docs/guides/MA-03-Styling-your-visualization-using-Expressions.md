# Styling your visualization using Expressions

CARTO VL styling is based on the concept of visualizations. A visualization is a set of styling properties that are assigned expressions. Visualizations allow you to control everything from the color of features to the styling of interactivity events.

## Styling properties
Visualizations have a fixed set of styling properties like `color` or `width` that adapt automatically to the geometry type:

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


## What is an expression?

As seen above, each styling property is assigned a value that is considered to be an expression. Expressions can be constants like `red`, `#FFF`,`7` and operations like `sqrt`, `+`, or `ramp`.

```CARTO_VL_Viz
width: 7
color: white
```

Expression constants and operations can be combined together to create _expression functions_:

```CARTO_VL_Viz
width: 7+3
color: white
```

Each expression function imposes limitations on the types of expressions that can be used as its input parameters. 

For example, the styling below would not work because a numeric parameter (`7`) can't be added to a color parameter (`white`):

```CARTO_VL_Viz
width: 7+white
```

Similarly, even though the `7+3` is valid, this example would not work because a numeric expression is being assigned to the styling property `color`: 

```CARTO_VL_Viz
color: 7+3
```

For a complete list of types and valid functions, see the [reference](https://carto.com/developers/carto-vl/reference/).

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
In contrast with cascading languages like CSS and CSS-derived languages, CARTO VL styling properties cannot be redefined based on selectors. Instead, CARTO VL expressions like `ramp` are used to select the expected values based on some input (the selector).

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
