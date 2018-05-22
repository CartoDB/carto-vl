## Introduction to Styling

This guide walks through making a variety of visualizations for points, lines, and polygons using CARTO VL.

### Supported Color Spaces

* [HEX](https://carto.com/developers/carto-vl/reference/#cartoexpressionshex)
* RGB(A)
* Named Colors
* HSV(A)
* HSL(A)
* CIELAB

In addition to these [supported color spaces](http://cartovl-tabs.developers.carto-staging.com/developers/carto-vl/examples/#example-color-spaces), you can also use our [CARTOcolors](https://carto.com/carto-colors/) schemes directly.

## Basic Styling Properties

* Color
* Width
* Stroke color
* Stroke width
* Resolution
* Opacity

### Color
Use the `color` property to define the fill color of a point, line or polygon.

```
color: #F24440
```

### Width
Use the [`width`](https://carto.com/developers/carto-vl/reference/#cartoexpressionswidth) property to define a point size or line width.

```
width: 5
```

### Stroke Color
Use the `strokeColor` property to define the color of a point or polygon stroke.

```
strokeColor: #F24440
```

### Stroke Width
Use the `strokeWidth` property to define the size of a point or polygon stroke width.

```
strokeWidth: 3
```

### Resolution
Use `resolution` to aggregate points into clusters.

```
resolution: 5
```

### Opacity
Set a feature´s opacity with the alpha channel or inside of a [`ramp`](https://carto.com/developers/carto-vl/reference/#cartoexpressionsramp) expression.

```
color: rgba(232,66,244,0.5)
```
```
color: opacity(ramp($animals,Prism),0.5)
```

## Color by value

### Style by category

#### All categories
Use the [`ramp`](https://carto.com/developers/carto-vl/reference/#cartoexpressionsramp) expression to style your points, lines or polygons by categories. The example below assigns a unique color to each type of animal using the CARTOColor scheme `Prism`.

```
color: ramp($animals,Prism)
```

#### Manual

To map colors to particular categories, use [`buckets`](https://carto.com/developers/carto-vl/reference/#cartoexpressionsbuckets). In the example below the top 4 types of animals are assigned a unique color and all the other features are colored as other.

```
color: ramp(buckets($animals, ["dogs", "cats", "birds"]),[red, orange, blue, grey])
```

#### Top categories

To color features by the most common category, you can use the expression [`top`](https://carto.com/developers/carto-vl/reference/#cartoexpressionstop). In the example below we are using it to retrieve the top 4 values in the `$animals` column. Each category is colored with a unique color and all the other features are colored as other.

```
color: ramp(top($animals, 4),Prism)
```

### Style by number

#### Quantiles
Use [quantiles](https://carto.com/developers/carto-vl/reference/#cartoexpressionsglobalquantiles) or other available classification methods to group features into a defined set of bins and color them using a sequential color scheme.

```
color: ramp(viewportQuantiles($price, 5), Prism)
```

#### Interpolate
Use [`linear`]
(https://carto.com/developers/carto-vl/reference/#cartoexpressionslinear) to linearly interpolate the value of a given input between min and max.

```
color: ramp(linear($price, 10000, 500000), Prism)
```

#### Manual

```
color: ramp(buckets($price, [50, 100, 500, 1000]), Prism)
```

## Size by value

### By attribute value

```
width: $price
```

### Interpolate

```
width: blend(5,20,$price/100)
```

### Manual

```
color: ramp(buckets($price, 50, 100, 500, 1000), Prism)
```
