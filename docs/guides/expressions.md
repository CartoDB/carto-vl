# Expressions

**Expressions** are functions to manipulate static, dynamic or data-driven information which is used to define the style properties of a layer. Main types of expressions are: *Number*, *String*, *Color* and *Date* (more info at #Types).

**Style properties** are attributes that affect the visualization of the data for the supported geometry types: points, lines and polygons. The supported style properties are:

| Style property | Expression type | Description | Geometries |
|---|---|---|---|---|
| `color` | *Color* | fill color | points, lines, polygons |
| `width` | *Number* | diameter / width | points, lines |
| `strokeColor` | *Color* | color of the stroke | points, polygons |
| `strokeWidth` | *Number* | width of the stroke | points, polygons |
| `filter` | *Number* | delete mismatched elements | points, lines, polygons |
| `resolution` | *number* | size of the aggregation cell | points |

All expressions and style properties should be defined inside a **Visualization object** (*carto.Viz*). There are two main ways or APIs to define a Viz object:

**String API**

```js
const viz = new carto.Viz(`
  // your code here
`);
```

**JavaScript API**

```js
// Shortcut alias for the namespace
const e = carto.expressions;
const viz = new carto.Viz({
  // your code here
});
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


## Variables


## Properties


## Functions


## Eval

e.g. {r: 255, g: 0, b: 0, a: 1}
