# Data-driven visualizations

## What is a ramp?

`ramp` is a special CARTO VL expression that outputs values based on an input. Depending on the type of the input the matching will be performed in different ways:
- One-to-one mapping is performed when the number of possible categories in the input matches the number of values. For example: `ramp(buckets($electionWinner, ['conservatives', 'progressives', 'liberals']), [red, blue, orange])`
- Interpolation is performed otherwise, this allows to create intermediate values automatically. For example: `ramp($temperature, [blue, red])` will assign the color blue to the "cold" features and red to the "hot" ones.

TODO maybe the map examples with the previous cases

`ramp` values don't need to be colors, but for simplicity's shake will stick to that until the "Ramp Values" section.

## Ramp inputs

### Numerical properties

linear, classifiers

### Categorical properties

buckets, top, raw


## Ramp values

color list, number color, cartocolors, colorbrewer, images

## Generating legends with ramps







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
