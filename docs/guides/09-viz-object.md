# The VIZ object

A Viz object defines how the data will be displayed: the color of the elements and size are basic things that can be managed through vizs but
it also controls the element visibility ordering or aggregation level.

A viz object can be created using two different apis: the `string` API and the `javascript` API. This two apis are very similar and we recommend to use the `string` form for the most the cases but this guide will cover both.

## What is a VIZ
To create a [layer](https://carto.com/developers/carto-vl/reference/#cartolayer) you will need two things: the `source` and the `viz`. 
The source answers `which` data will be displayed and the viz points `how` the data will be shown.

### Properties

A viz is formed by multiple properties each one attached to an [expression](https://carto.com/developers/carto-vl/reference/#cartoexpressions)
the configurable properties are:

- **color** : Determine the element fill color.
- **strokeColor** : Determine the element border color.
- **width** : Determine the element width: diameter when points, thickness when lines, not used for polygons.
- **strokeWidth** : Determine the element border size.
- **order** : This is a special property used to order the elements in ascendent/descendent order.
- **filter** : This is a special property used to remove elements that do not meet the expression.
- **resolution** : Determine the resolution of the property-aggregation functions.

You can create the same VIZ using both `string` and `javascript` options:

Using the string API:

```js
const viz = new carto.Viz(`
    color: red
    width: 10
`);
```

And with the javascript API:

```js
const s = carto.expressions;
const viz = new carto.Viz({
    color: s.namedColor('red'),
    width: s.number(10),
});
```

As you see we are specifying `HOW` the data should be displayed using a [color expression](https://carto.com/developers/carto-vl/reference/#cartoexpressionsnamedcolor) and a [number expression](https://carto.com/developers/carto-vl/reference/#cartoexpressionsnumber)

The point about expressions is that you can combine them to form more powerful ones

## Dataset columns

You can style your map based on the values of the columns using the [prop](https://carto.com/developers/carto-vl/reference/#cartoexpressionsprop) expression. When using the `string` option, you just need to prefix the property name with a `$`.

Using the string API:

```js
const viz = new carto.Viz(`
    width: $price
`);
```

Using the javascript API:

```js
const s = carto.expressions;
const viz = new carto.Viz({
    width: s.prop('price'),
});
```

## Variables
The VIZ object has a `variables` section where you can define custom variables. This section is used to:

- **Specify interative fields**: All declared variables will be availiable in the interactivity API.
- **Alias**: If you use a long named property you can give it an alias.
- **Create new data**: Create new properties derived from another ones or agregate data.

With the `javascript` api you need your key-value pairs in an object called variables, the new variable will have the key name.

To declare a variable with the `string` api you just need to prefix it with `@`. Use the [var expression](https://carto.com/developers/carto-vl/reference/#cartoexpressionsvar) with the javascript API.

> Example: Create a variable named `p` and use it in the width.

With the string API:

```js
const viz = new carto.Viz(`
    @p: $price / 100
    width: @p
`);
```

With the javascript API:

```js
const s = carto.expressions;
const viz = new carto.Viz({
    variables: {
        p: s.div(s.prop('price'), 100),
    },
    width: s.var('p')
});
```
