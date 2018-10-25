## The Basics of Syntax

CARTO VL introduces a new language to style your data from static, dynamic, and data-driven information. This new language is based on CartoCSS syntax but adds new visualization capabilities to describe your vector data layers.

This language is used to define **[style properties](https://carto.com/developers/carto-vl/guides/introduction-to-styling/#styling-properties)** using **[expressions](https://carto.com/developers/carto-vl/guides/introduction-to-expressions/)**. All expressions and style properties should be defined inside a **Visualization object** ([`carto.Viz`](https://carto.com/developers/carto-vl/reference/#cartoviz)). It is the second parameter to create a `carto.Layer`, after the [`carto.source`](https://carto.com/developers/carto-vl/reference/#cartosourcedataset) parameter.

There are two ways to define a `carto.Viz` object:

**String API**

This is the easier and shorter way. The `carto.Viz` object gets a string with all the code. It is recommended to use E6 back-ticks (\`) to enjoy multiline string capabilities.

```js
const viz = new carto.Viz(`
  // your visualization here
`);
```

**JavaScript API**

This way uses a *JavaScript object* as a parameter of the `carto.Viz` object. It is more verbose but allows to use directly JavaScript elements (like variables or functions) to describe your visualization. All the expressions are grouped by the namespace [`carto.expressions`](https://carto.com/developers/carto-vl/reference/#cartoexpressions). It is recommended to use a shortcut alias for the namespace.

```js
const s = carto.expressions;
const viz = new carto.Viz({
  // your visualization here
});
```

### Style properties

**[Style properties](https://carto.com/developers/carto-vl/guides/introduction-to-styling/#styling-properties)** are attributes that affect the visualization of the data for the supported geometry types: points, lines and polygons. All the style properties are typed, this means that it only admits one kind of expression (see [Types of expressions](https://carto.com/developers/carto-vl/guides/introduction-to-expressions/#types)).

The supported style properties are:

| **Style property** | **Expression type** | **Description**              | **Geometries**          |
|--------------------|---------------------|------------------------------|-------------------------|
| `color`            | *Color*             | fill color                   | points, lines, polygons |
| `width`            | *Number*            | diameter / width             | points, lines           |
| `strokeColor`      | *Color*             | color of the stroke          | points, polygons        |
| `strokeWidth`      | *Number*            | width of the stroke          | points, polygons        |
| `filter`           | *Number*            | delete mismatched elements   | points, lines, polygons |
| `resolution`       | *Number*            | size of the aggregation cell | points                  |

#### Example

The following code shows how to style a dataset of points (`world_cities`) by a fixed `width` for the diameter, in both APIs:

**String API**

```js
const source = new carto.Dataset('world_cities');
const viz = new carto.Viz(`
  width: 10
`);
const layer = new carto.Layer(source, viz);
```

**JavaScript API**

```js
const source = new carto.Dataset('world_cities');
const viz = new carto.Viz({
  width: 10
});
const layer = new carto.Layer(source, viz);
```

Style properties can be accessed directly from the `carto.Viz` object. If they do not contain dynamic (animation) or data-driven (properties) information, they can also be evaluated:

```js
viz.width.eval();  // 10
```

### Properties

**Properties** are a way to access your data. For **Windshaft** sources (`carto.Dataset`, `carto.SQL`) the properties represent the columns of the tables in the database. For **GeoJSON** sources (`carto.GeoJSON`) the properties are exactly the ones defined in the `properties` object for each feature.

We use `$` notation followed by a column/property name to refer the property in the *String API*. We can also use the function `prop('name')` in case our property name contains spaces, for example `prop('city name')`. The expression `s.prop('name')` can also be used to refer to properties in the *JavaScript API*.

These properties cannot be immediately evaluated, they have no global meaning, but they are evaluated for each feature. Therefore, expressions containing properties should be treated as declarations or templates that will be executed and evaluated for each feature with the specific feature data.

#### Example

Suppose you have a dataset that contains all the `world_cities` as points. The table has a numeric column called `density` and you want to create a bubble map in which the size of each city is its density value. The following code implements that behavior in both APIs:

**String API**

```js
const source = new carto.Dataset('world_cities');
const viz = new carto.Viz(`
  width: $density  // Equivalent to prop('density')
`);
const layer = new carto.Layer(source, viz);
```

**JavaScript API**

```js
const source = new carto.Dataset('world_cities');
const s = carto.expressions;
const viz = new carto.Viz({
  width: s.prop('density')
});
const layer = new carto.Layer(source, viz);
```

If the string column `city_name` (column of strings) is used instead of `density` an Error will be thrown because the style property `width` expects a *Number*.

### Variables

**Variables** are a way to store and reuse expressions.

We use the `@` notation followed by the name to declare and use the variable in the *String API*. The expression `s.var('name')` can also be used to refer to variables in the *JavaScript API*, that should be declared inside the `variables` scope.

**String API**

```js
const viz = new carto.Viz(`
  @size: 10
  width: @size
`);
```

**Javascript API**

```js
const s = carto.expressions;
const viz = new carto.Viz({
  variables: {
    size: 10
  },
  width: s.var('size')
});
```

Variables can be accessed directly from the `carto.Viz` object. If variables do not contain dynamic (animation) or data-driven (properties) information can be also evaluated:

```js
viz.variables.size.eval();  // 10
```

#### Data-driven variables

If the variables contain data-driven information (properties) can be evaluated from the feature object in the interactivity event callbacks (see [interactivity events](https://carto.com/developers/carto-vl/guides/introduction-to-interactivity/#interactivity-events)).

**String API**

```js
const viz = new carto.Viz(`
  @size: sqrt($population) / 100
`);
[...]
interactivity.on('featureClick', event => {
  event.features[0].variables.size.eval();  // Different value for each clicked feature
});
```

**Javascript API**

```js
const s = carto.expressions;
const viz = new carto.Viz({
  variables: {
    size: s.div(s.sqrt(s.prop('population')), 100)
  }
});
[...]
interactivity.on('featureClick', event => {
  event.features[0].variables.size.eval();  // Different value for each clicked feature
});
```
