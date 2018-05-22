## Expressions

**Expressions** are functions to manipulate static, dynamic and data-driven information which is used to define the style properties of a layer. Main types regarding expressions are: *Number*, *String*, *Color* and *Date*. The language includes also *Arrays* to define lists of string categories, custom palettes, etc.

### Types

#### Number

This is the equivalent to the *JavaScript number* type,
e.g. `1`, `2 + 3`, `4 * 5`. There are also some numeric constants defined: `TRUE`, `FALSE`, `PI`, `E`. Numeric expressions can be evaluated to get the result:

```js
const viz = new carto.Viz(`
  @var: sqrt(2)
`);
viz.variables.var.eval();  // 1.4142135623730951
```

#### String

This is the equivalent to the *JavaScript string* type, e.g. `'a'`, `"b"`. They could be used to define lists of categories.

```js
const viz = new carto.Viz(`
  @categories: ['a', 'b', 'c']
`);
```

#### Color

This is a composed type to define the colors. It is defined as a *JavaScript object* with the following RGBA structure:

```js
{ r: 255, g: 0, b: 0, a: 1 }
```

In the language there are several ways to define a color, e.g. `red`, `#AAA`, `hsv(0.67, 1.0, 1.0)`. They can be used directly, or within an array to define a custom palette.

```js
const viz = new carto.Viz(`
  @color: rgba(127, 100, 10, 0.7)
  @customPalette: [red, green, blue]
`);
```

#### Date

This is the equivalent to the *JavaScript Date* type. It is used for animations and can be defined by `time` or `date`, e.g. `date('2022-03-09T00:00:00Z')`.

```js
const viz = new carto.Viz(`
  @begin: date('1970-01-01T00:00:00Z')
  @end: date('2022-03-09T00:00:00Z')
`);
```

## Basic expressions

### Operations

#### Unary

This is the list of the available unary operations: `log`, `sqrt`, `sin`, `cos`, `tan`, `sign`, `abs`, `isNaN`, `not`, `floor`, `ceil`.

```js
const viz = new carto.Viz(`
  width: sqrt($population)
  strokeWidth: not($nat)
`);
```

### Binary

This is the list of the available binary arithmetic operations: `mul`, `div`, `add`, `sub`, `mod`, `pow`. There are also binary comparison operators: `gt`, `gte`, `lt`, `lte`, `eq`, `neq`, `or`, `and`.

```js
const viz = new carto.Viz(`
  color: red + blue
  width: $population / 100
  strokeWidth: ($population > 10^5) * 5
`);
```

### Colors

This is the list of the available color expressions: `rgb`, `rgba`, `hsl`, `hsla`, `hsv`, `hsva`, `cielab`, `opacity`, `hex`, `namedColor`.

```js
const viz = new carto.Viz(`
  @myColor: #FABADA
  color: @myColor
  strokeColor: opacity(@myColor, 0.7)
`);
```

There are a set of Palettes ([CARTOColors](https://carto.com/carto-colors/)) shiped with the language under the namespace `carto.expressions.palettes` in the JavaScript API or directly by using the palette's name in the String API.

```js
const viz = new carto.Viz(`
  @palette: PRISM
`);
```

### Aggregations

#### Viewport

Viewport aggregations evaluate the provided expression with the features showed in the map. This is the list of the viewport aggregations: `viewportAvg`, `viewportMax`, `viewportMin`, `viewportSum`, `viewportCount`, `viewportPercentile`, `viewportHistogram`.

```js
const viz = new carto.Viz(`
  @view_total: viewportCount($cities)
`);
[...]
viz.variables.view_total.eval();
```

#### Global

Global aggregations evaluate a property for all the features in the source data. These are the available global aggregations: `globalAvg`, `globalMax`, `globalMin`, `globalSum`, `globalCount`, `globalPercentile`.

```js
const viz = new carto.Viz(`
  @total: globalCount($cities)
`);
[...]
viz.variables.total.eval();
```

#### Cluster

Cluster aggregations generates a new property aggregating the provided property with a specific resolution. These aggregations are made in back-end and they are: `clusterAvg`, `clusterMax`, `clusterMin`, `clusterMode`, `clusterSum`. There are not available for *GeoJSON* sources.


```js
const viz = new carto.Viz(`
  width: clusterAvg($population)
  resolution: 2.5
`);
```

**Note:**
These operations disable the access to the property except within other cluster aggregate functions.
