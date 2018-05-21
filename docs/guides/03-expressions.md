# Expressions

**Expressions** are functions to manipulate static, dynamic and data-driven information which is used to define the style properties of a layer. Main types of expressions are: *Number*, *String*, *Color* and *Date* (more info at #Types).

**Style properties** are attributes that affect the visualization of the data for the supported geometry types: points, lines and polygons. The supported style properties are:

| Style property | Expression type | Description | Geometries |
|---|---|---|---|---|
| `color` | *carto.expression.Color* | fill color | points, lines, polygons |
| `width` | *carto.expression.Number* | diameter / width | points, lines |
| `strokeColor` | *carto.expresison.Color* | color of the stroke | points, polygons |
| `strokeWidth` | *carto.expresison.Number* | width of the stroke | points, polygons |
| `filter` | *carto.expresison.Number* | delete mismatched elements | points, lines, polygons |
| `resolution` | *number* | size of the aggregation cell | points |

All expressions and style properties should be defined inside a **Visualization object** (*carto.Viz*). There are two main ways or APIs to define a Viz object:

```js
const viz = new carto.Viz(`
  // your code here
`);
```

## Types

### Number

e.g. 1, PI, 2+3

### String

e.g. 'a', "b"

### Color

e.g. red, #AAA, hsv(0.67, 1.0, 1.0)

### Date

e.g. date('2022-03-09T00:00:00Z')

## Arrays

e.g. [1, 2, 3]

e.g. ['a', 'b', 'c']

e.g. [red, green, blue]

e.g. [date('2022-03-09T00:00:00Z')]

## Palettes

carto.expression.palettes.PRISM

CartoColors

## Properties

**Properties** are a way to access your data. For **Windshaft** sources (*carto.Dataset*, *carto.SQL*) the properties represent the columns of the tables in the database. For **GeoJSON** sources (*carto.GeoJSON*) the properties are exactly the ones defined in the `properties` object for each feature.

We use the `$` notation followed by the column/property name (`$name`) to refer the property in the *String API*. The expression `e.prop('name')` can also be used to refer to properties in the *JavaScript API*.

These properties cannot be immediately evaluated, they have no global meaning, but they are evaluated for each feature. Therefore, expressions containing properties should be treated as declarations or templates that will be executed and evaluated for each feature with the specific feature data.

### Example

Suppose you have a Dataset that contains all the `world_cities` as points. The table has a numeric column called `density` and you want to create a *Bubble map* in which the size of each city is its density value. The following code implements that behavior:

```js
const source = new carto.Dataset('world_cities');
const viz = new carto.Viz(`
  width: $density
`);
const layer = new carto.Layer(source, viz);
```

If the string column `city_name` is used instead of `density` an Error will be thrown because the style property `width` expects a *Number*.

## Variables

**Variables** are a way to store and reuse expressions.

We use the `@` notation followed by the name (`@name`) to declare and use the variable in the *String API*. The expression `e.var('name')` can also be used to refer to variables in the *JavaScript API*, that should be declared inside the `variables` scope.

```js
const viz = new carto.Viz(`
  @myVariable: 1 + 1
`);
```

Variables can be accessed directly from the Viz object. If variables do not contain dynamic (animation) or data-driven (properties) information can be also evaluated:

```js
viz.variables.myVariable.eval();  // 2
```

If the variables contain data-driven information (properties) can be evaluated from the feature object in the interactivity event callbacks. More information at (Link to events).

```js
const viz = new carto.Viz(`
  @size: sqrt($population) / 100
`);
[...]
interactivity.on('featureClick', event => {
  event.features[0].variables.size.eval();  // Different value for each clicked feature
});
```

## Functions

### Numeric functions

### String functions

### Color functions

### Date functions

## Eval

e.g. {r: 255, g: 0, b: 0, a: 1}
