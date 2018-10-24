## Style with Expressions
CARTO VL styling is based on the concept of visualizations. A visualization is a set of styling properties and variables that are assigned expressions. Visualizations allow you to control everything from the color of features to the available properties in interactivity events.

### Styling properties
Visualizations have a fixed set of styling properties like `color` or `width` that adapt automatically to the geometry type:

<div class="example-map">
    <iframe
        id="population-density-basic"
        src="/developers/carto-vl/examples/maps/guides/viz-properties/geom-types.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>
 <a href="/developers/carto-vl/examples/#example-geometry-types">View my source code!</a>

The complete list of CARTO VL styling properties and their semantics can be seen [here](/developers/carto-vl/reference/#vizspec).

### What is an expression?
As seen above, each styling property is assigned a value that is considered to be an expression. Expressions assigned to properties can be constants (like `red`, `#FFF`,`7`) or functions (like `sqrt`, `+`, or `ramp`).

```js
width: 7
color: white
```

Expressions can be combined together with _expression functions_:

```js
width: 7+3
color: white
```

**Note:**
The concept of *function* and its related terms *function call* and *function parameter* are borrowed from programming terminology. 
A **function** is a transformation between inputs, the **function parameters**, to an output. A **function call** is the application of the function to some values as the **function parameters**.


Each expression imposes limitations on the types of expressions that can be used as its input parameters.

For example, the styling below would _not work_ because a numeric parameter (`7`) can't be added to a color parameter (`white`):

```js
width: 7+white
```

Similarly, even though the `7+3` is valid, this example would _not work_ because a numeric expression (the addition) is being assigned to the styling property `color` (which accepts color expressions):

```js
color: 7+3
```

For a complete list of types and valid functions, see the [reference](/developers/carto-vl/reference/).

### Color expression basics

There are multiple ways to get color expressions (expressions whose type is `color`):
- **color constants**: are colors defined by name (`red`, `blue`, `white`...) or by hexadecimal RGB(A) composition (`#F88`, `#F88A`, `#F08080`, `#F08080A0`).
- **color constructors**: are functions that define colors by the components of its color space: `rgba(255, 255, 255, 0.6)`, `hsv(0, 1, 1)`.
- **`opacity` function**: overrides an input color's alpha channel.
- **`ramp` function**: which is introduced in the "Data Driven visualization" guide.
- Other advanced expressions like color arithmetic or blending.

<div class="example-map">
    <iframe
        id="population-density-basic"
        src="/developers/carto-vl/examples/maps/styling/color-spaces.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples#example-color-spaces">View my source code!</a>

You can take a look at the [reference](/developers/carto-vl/reference/) for a detailed description of all color expressions.

#### Transparency, alpha channel, opacity, and filtering
There are multiple ways to set the alpha channel:
* Using a color constant or color constructor. Use this whenever you can (i.e., you want to change the alpha channel of a color constant or color constructor). For example: `rgba(255,255,255,0.5)` or `#F375`.
* Using `opacity` to override the alpha channel. You should use this when the input color expression is not a color constant or color constructor. For example, it is very common to combine `opacity` with `ramp`. For example: `opacity(ramp($price, prism), 0.5)`
* Using the `filter` property. The filter property multiplies the color alpha channel (both fill and stroke) of the features with its value. This, however, has a special semantic regarding viewport aggregation expressions. We'll look at this later.

### Numeric and boolean expressions basics
In CARTO VL numeric expressions are a first class citizen. You have access to math like `+`, `-`, `*`,`/`,`^`,`log`,`sin`... out of the box.

You can also get boolean-like values within CARTO VL. Some ways to get these “boolean-like” types are comparison functions (`==`, `!=`, `>`, `<`, `>=`), utils (`between`, `in`) and logic functions (`not`, `or`, `and`).

We talk about boolean-like types and not just boolean types because there is no “boolean” type in CARTO VL. Every “boolean-like” type is actually emulated by the numeric type. This makes our boolean logic a [fuzzy boolean logic](https://en.wikipedia.org/wiki/Fuzzy_logic), making most animations (blendings) work out of the box.

### Accessing dataset feature properties
To access feature properties from a dataset, use the dollar sign (`$`). For example, `$price` refers to a feature property named ‘price’ in a dataset.

We’ll use this extensively in the [Data-driven visualization guide](/developers/carto-vl/guides/data-driven-visualizations-part-1/).

### Accessing and modifying visualization properties

Once a visualization has been created, you can access and modify all styling properties through the returned [Visualization]().

Once you have a `Visualization` object, you can:
- Get its property values by using the `.value` getter: `const currentColor = viz.color.value;`
- Modify its property values by using the`.blendTo()` method: `viz.color.blendTo(‘green’);`

<div class="example-map">
    <iframe
        id="population-density-basic"
        src="/developers/carto-vl/examples/maps/guides/viz-properties/accessing-viz-properties.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples#example-color-spaces">View my source code!</a>

### The String and JavaScript Visualization APIs

CARTO VL provides two equivalent and similar APIs to define visualizations: String and JavaScript. Until now, we have seen the String API syntax which is nothing more than a small layer of syntax sugar for the JavaScript API. In fact, internally, the usage of the String API is implemented through the usage of the public JavaScript API.

Usage of the JavaScript API can facilitate some advanced topics, but both are equivalent and everything that can be done through the JavaScript API can be done with the String API and vice versa.

In the [reference](/developers/carto-vl/reference/) documentation examples are shown with both APIs for each expression, but let’s look at an example of coloring a feature `red` and setting its width to `5`:

Usage of the String API:
```js
const viz = new carto.Viz(`
    width: 5
    color: red
`);
```

Usage of the JS API:
```js
const s = carto.expressions;
const viz = new carto.Viz({
    width: 5
    color: s.namedColor(‘red’)
});
```

This example above shows how the String API provides syntax sugar for things like named colors. 

The String API also provides easier usage of:
* Arithmetic operators: `+, `/`, `^`...
* Boolean operators: `and`, `or`, `not`...
* Eliminates the need to access the `carto.expressions` namespace
* `#FFF` like color constants
* Accessing data properties with `$propertyName`
* Variables

### Variables

As we’ve seen, the CARTO VL visualization language follows a pattern: `property: expression`, where expression can be a constant or a function call of the form `functionName(param1, param2, …)` or a built-in infix function call like `param1/param2`.

Variables are not required to apply any of the CARTO VL styling capabilities although they can be used to simplify some visualizations. However, variables are required for [Interactivity](/developers/carto-vl/reference/#cartointeractivity).

The use of variables is covered more in-depth in the [Interactivity guide](/developers/carto-vl/guides/interactivity-events/).

### Comparison to CSS-derived languages

In contrast with cascading languages like CSS and CSS-derived languages, CARTO VL styling properties cannot be redefined based on selectors. Instead, CARTO VL expressions like `ramp` are used to select the expected values based on some input (the selector).

Below is a comparison between both approaches to get the gist of it (it's ok if you don't fully understand them now since we'll cover this in depth later in the Data driven visualization guide):

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

