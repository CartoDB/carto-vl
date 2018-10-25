## Introduction to Styling

This guide walks through making a variety of visualizations for points, lines, and polygons using CARTO VL.

### Supported Color Spaces

CARTO VL's supported color spaces are [HEX](https://carto.com/developers/carto-vl/reference/#cartoexpressionshex), [RGB](https://carto.com/developers/carto-vl/reference/#cartoexpressionsrgb), [RGBA](https://carto.com/developers/carto-vl/reference/#cartoexpressionsrgba), [Named Colors](https://carto.com/developers/carto-vl/reference/#cartoexpressionsnamedcolor), [HSV](https://carto.com/developers/carto-vl/reference/#cartoexpressionshsv), [HSVA](https://carto.com/developers/carto-vl/reference/#cartoexpressionshsva), [HSL](https://carto.com/developers/carto-vl/reference/#cartoexpressionshsl), [HSLA](https://carto.com/developers/carto-vl/reference/#cartoexpressionshsla), [CIELAB](https://carto.com/developers/carto-vl/reference/#cartoexpressionscielab).

In addition to these, you can also use our [CARTOcolors](https://carto.com/carto-colors/) schemes directly.

### Styling Properties

#### Color
Use the `color` property to define the fill color of a point, line or polygon.

```js
color: #F24440
```

#### Width
Use the `width` property to define a point size or line width.

```js
width: 5
```

#### Stroke Color
Use the `strokeColor` property to define the color of a point or polygon stroke.

```js
strokeColor: #F24440
```

#### Stroke Width
Use the `strokeWidth` property to define the size of a point or polygon stroke width.

```js
strokeWidth: 3
```

#### Opacity

Set a feature's [`opacity`](https://carto.com/developers/carto-vl/reference/#cartoexpressionsopacity) with the alpha channel (see [supported Color Spaces](https://carto.com/developers/carto-vl/guides/introduction-to-styling/#supported-color-spaces)) or inside of a `ramp` expression.

```js
color: rgba(232,66,244,0.5)
```
```js
color: opacity(ramp($animals,Prism),0.5)
```

#### Resolution
Use `resolution` to aggregate points into clusters.

```js
resolution: 5
```

#### Filter
Use `filter` to show only the features that match the specified [expression](https://carto.com/developers/carto-vl/guides/introduction-to-expressions/).

```js
filter: between($numfloors, 10, 120)
```

### Style Color by Category

[Live example](https://carto.com/developers/carto-vl/examples/#example-style-by-category)

#### All categories
Use the [`ramp`](https://carto.com/developers/carto-vl/reference/#cartoexpressionsramp) expression to style your points, lines or polygons by categories. The example below assigns a unique color to each type of animal using the CARTOColor scheme `Prism`.

```js
color: ramp($animals,Prism)
```

#### Manual
To map colors to particular categories, use [`buckets`](https://carto.com/developers/carto-vl/reference/#cartoexpressionsbuckets). In the example below the manually defined types of animals are assigned a unique color and all the other features are colored as other.

```js
color: ramp(buckets($animals, ["dogs", "cats", "birds"]),[red, orange, blue, grey])
```

#### Top categories
To color features by the most common category, you can use the expression [`top`](https://carto.com/developers/carto-vl/reference/#cartoexpressionstop). In the example below we are using it to retrieve the top 4 values in the `$animals` column. Each category is colored with a unique color and all the other features are colored as other.

```js
color: ramp(top($animals, 4),Prism)
```

### Style Color by Number

[Live example](https://carto.com/developers/carto-vl/examples/#example-style-by-number)

#### Quantiles
Use [`quantiles`](https://carto.com/developers/carto-vl/reference/#cartoexpressionsquantiles) or other available classification methods to group features into a defined set of bins and color them using a sequential color scheme.

```js
color: ramp(viewportQuantiles($price, 5), Prism)
```

#### Interpolate
Use [`linear`](https://carto.com/developers/carto-vl/reference/#cartoexpressionslinear) to linearly [interpolate](https://carto.com/developers/carto-vl/guides/introduction-to-interpolation/) the value of a given input between min and max.

```js
color: ramp(linear($price, 10000, 500000), Prism)
```

#### Manual
To map colors to particular categories, use [`buckets`](https://carto.com/developers/carto-vl/reference/#cartoexpressionsbuckets). In the example below the manually defined prices are assigned a unique color and all the other features are colored as other.

```js
color: ramp(buckets($price, [50, 100, 500, 1000]), [purple, red, orange, yellow, grey])
```

### Style Size by Number

#### By attribute value
Use the `width` property to define a point size or line width by an attribute value. The example below will assign different sizes to the geometry depending of the price value associated to each one.

```js
width: $price
```

#### Interpolate
Use [`blend`](https://carto.com/developers/carto-vl/reference/#cartoexpressionsblend) to linearly [interpolate](https://carto.com/developers/carto-vl/guides/introduction-to-interpolation/) the value of a given input between min and max.

```js
width: blend(5,20,$price/100)
```

#### Manual
To map sizes to particular categories, use [`buckets`](https://carto.com/developers/carto-vl/reference/#cartoexpressionsbuckets). In the example below the manually defined prices are assigned a unique color and all the other features are colored as other.

```js
width: ramp(buckets($price, [50, 100, 500, 1000]), [5, 10, 15, 20, 2])
```
