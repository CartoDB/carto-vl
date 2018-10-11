# Styling your visualization using Expressions

CARTO VL styling is based on the concept of visualizations. A visualization is a set of styling properties and variables that are assigned expressions. Visualizations allow you to control everything from the color of features to the available properties in interactivity events.

## Styling properties
Visualizations have a fixed set of styling properties like `color` or `width` that adapt automatically to the geometry type:

<div class="example-map">
    <iframe
        id="population-density-basic"
        src="/developers/carto-vl/examples/maps/viz-properties/geom-types.html"
        width="100%"
        height="1000"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
    <a href="/developers/carto-vl/examples/guides/ramp#geom-types">View my source code!</a>
</div>

The complete list of CARTO VL styling properties and their semantics can be seen [here](https://carto.com/developers/carto-vl/reference/#vizspec).


## What is an expression?


As seen above, each styling property is assigned a value that is considered to be an expression. Expressions assigned to properties that can be constants (like `red`, `#FFF`,`7`) or functions (like `sqrt`, `+`, or `ramp`).


```CARTO_VL_Viz
width: 7
color: white
```

Expressions can be combined together with _expression functions_:

```CARTO_VL_Viz
width: 7+3
color: white
```


*Note: about function terminology*

The concept of *function* and its related terms *function call* and *function parameter* are borrowed from programming terminology.

A *function* is a transformation between inputs, the *function parameters*, to an output.

A *function call* is the application  of the function to some values as the *function parameters*.


Each expression imposes limitations on the types of expressions that can be used as its input parameters.


For example, the styling below would not work because a numeric parameter (`7`) can't be added to a color parameter (`white`):

```CARTO_VL_Viz
width: 7+white
```

Similarly, even though the `7+3` is valid, this example would not work because a numeric expression (the addition) is being assigned to the styling property `color` (which accepts color expressions):

```CARTO_VL_Viz
color: 7+3
```

For a complete list of types and valid functions, see the [reference](https://carto.com/developers/carto-vl/reference/).

## Color expression basics

There are multiple ways to get color expressions (expressions with type color):
- **Color constants** are colors defined by its name (`red`, `blue`, `white`...) or by its hexadecimal RGB(A) composition (#F88, #F88A, #F08080, #F08080A0).
- **Color constructors** are functions that define colors by the components of its color space: `rgba(255, 255, 255, 0.6)`, `hsv(0, 1, 1)`.
- The **`opacity`** function, which overrides an input color alpha channel
- The **`ramp`** function, which will be introduced in the "Data Driven visualization" guide.
- Other advanced expressions like color arithmetic or blending


TODO embed examples/styling/color-spaces.html

You can take a look at the reference for a detailed description of all color expressions.

### Transparency, alpha channel, opacity, and filtering

There are multiple ways to set the alpha channel:
- The alpha channel when using a color constant or color constructor. You should use this whenever you can (i.e., you want to change the alpha channel of a color constant or color constructor). For example: `rgba(255,255,255,0.5)` or `#F375`.
- Using `opacity` to override the alpha channel. You should use this when the input color expression is not a color constant or color constructor. For example, it is very common to combine `opacity` with `ramp`. For example: `opacity(ramp($price, prism), 0.5)
- Using the `filter` property. The filter property multiplies the color alpha channel (both fill and stroke) of the features with its value. This, however, has a special semantic regarding viewport aggregation expressions. We'll look at this later.


## Numeric and boolean expressions basics

In CARTO VL numeric expressions are a first class citizen. You have access to math like `+`, `-`, `*`,`/`,`^`,`log`,`sin`... out of the box.

You’ll also be able to get boolean-like values within CARTO VL. Some ways to get these “boolean-like” types are comparison functions (`==`, `!=`, `>`, `<`, `>=`), utils (`between`, `in`) and logic functions (`not`, `or`, `and`).

We talk about boolean-like types and not just boolean types because there is no “boolean” type in CARTO VL. Every “boolean-like” type is actually emulated by the numeric type.
This makes our boolean logic a [fuzzy boolean logic](https://en.wikipedia.org/wiki/Fuzzy_logic), making most animations (blendings) work out of the box.

## Using dataset feature properties
To refer to a dataset feature property we can use the dollar sign. For example, `$price` refers to the features property named ‘price’ in the dataset.

We’ll use this extensively in the Data-driven visualization guide.

## Accessing and modifying visualization properties

Once a visualization has been created, you can access and modify all the styling properties through the returned [Visualization]().

Once you have a `Visualization` object, you can:
- Get its property values by using the `.value` getter: `const currentColor = viz.color.value;`
- Modify its property values by using the`.blendTo()` method: `viz.color.blendTo(‘green’);`

<div class="example-map">
    <iframe
        id="population-density-basic"
        src="/developers/carto-vl/examples/guides/viz-properties/accessing-viz-properties.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>


## The String and the JS Visualization APIs

CARTO VL provides two equivalent and similar APIs to define visualizations. Until now, we have seen the String API which is nothing more than a small layer of syntax sugar for the JS API. In fact, internally, the usage of the String API is implemented through the usage of the public JS API.

Usage of the JS API can facilitate some advanced topics, but both are equivalent and everything that can be done through the JS API can be done with the String API and vice versa.

In the reference documentation you’ll be able to see examples with both APIs for each expression, but let’s see some examples:

```Javascript
// Usage of the String API
const viz = new carto.Viz(`
    width: 5
    color: red
`);
```

```Javascript
// Usage of the JS API
const s = carto.expressions;
const viz = new carto.Viz({
    width: 5
    color: s.namedColor(‘red’)
});
```

As you can see, the String API provides some syntax sugar for named colors. It also provides easier usage of:
Arithmetic operators: `+, `/`, `^`...
Boolean operators: `and`, `or`, `not`...
Eliminates the need to access the `carto.expressions` namespace
`#FFF` like color constants
Accessing data properties with `$propertyName`
Variables

## Variables

As we’ve seen, CARTO VL visualization language follows the next pattern: `property: expression`, where expression can be a constant or a function call of the form `functionName(param1, param2, …)` or a built-in infix function call like `param1/param2`.

The usage of variables is indeed not required for applying any of the CARTO VL styling capabilities. However, it is required for [Interactivity] and it can be used to simplify some visualizations.

We’ll cover this topic in depth on the [Interactivity] guide.

## Comparison to CSS-derived languages

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

