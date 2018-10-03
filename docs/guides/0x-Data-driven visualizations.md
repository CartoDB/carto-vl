# Data-driven visualizations

## What is a ramp?

[`ramp`](https://carto.com/developers/carto-vl/reference/#cartoexpressionsramp) is a special CARTO VL expression that outputs values based on an input. Depending on the type of the input the matching will be performed in different ways:
- One-to-one mapping is performed when the number of possible categories in the input matches the number of values. For example: `ramp(buckets($electionWinner, [conservatives', 'progressives', 'liberals']), [red, blue, orange])`
- Interpolation is performed otherwise, this allows to create intermediate values automatically. For example: `ramp($temperature, [blue, red])` will assign the color blue to the "cold" features and red to the "hot" ones.

TODO maybe the map examples with the previous cases

It's easy to create choropleth maps by using `ramp` with colors as the values. However, `ramp` values don't need to be colors, allowing creating different and richer types or maps like bubble-maps. But, for simplicity's sake, we will stick to colors until the [Ramp Values section](#Ramp-values).

## Ramp inputs

On the previous section, we talked about how `ramp` can be used to match *inputs* with *values*. In general, `ramp` allows matching most types of inputs with most types of values. But, the common case is to match a property as the input to fixed constant outputs like colors. This is what we call "Style by value".

The following sections will cover "Style by value" with different property types. For example, when dealing with a transaction dataset we could style by numeric data like the price of each feature, or by categorical data like the method of payment (credit card, cash...).

### Numerical properties

#### Showing raw / unclassified numerical data

Going back to our previous example, it's common to want to map a continuous range of numeric data like temperature data, to a continuous range of colors, for example, the range of colors between blue and red.

This is very easy to do with CARTO VL, as shown before you just need use:
 ```CARTOVL_Viz
 color: ramp($temperature, [blue, red])
 ```

 This will map the coldest feature in the Source data to *blue* and the hottest feature to *red*. You can even set intermediate colors in the color list like `[white, blue, red, purple]`.

 Matching the input with the context of the coldest and hottest feature is actually done by the [`linear`](https://carto.com/developers/carto-vl/reference/#cartoexpressionslinear) function, which is placed automatically by `ramp` when the input is a numeric property. CARTO VL `ramp` function just transforms `ramp($temperature, [blue, red])` to `ramp(linear($temperature), [blue, red])`. These transformations are what we call *implicit casts* and are a common topic in CARTO VL.

#### Overriding the default range and avoiding outliers

 Let's see another *implicit cast*, this time one a little bit more interesting.

 The [`linear`](https://carto.com/developers/carto-vl/reference/#cartoexpressionslinear) function has another *implicit cast*. When linear is called with only one parameter it will transform things like `linear($temperature)` to things like `linear($temperature, globalMin($temperature), globalMax($temperature))`. This is what sets the context of the coldest and hottest features for `ramp`.

 Sometimes, the data has outliers (features with data that is very far away from the norm). In these cases, we may want to ignore them when computing the `ramp`. This can be easily done by manually setting the second and third parameters of linear to the minimum and maximum values of the data range we are interested.

TODO Let's see it with one example.
TODO we could add an example with outliers and show different vizs:
TODO maybe temperature is a bad example because some people will think about Celsius and other about Fahrenheit
 ```CARTOVL_Viz
 // This will be implicitly casted to `ramp(linear($temperature), [blue, red])` which will be implcitly casted to
 // ramp(linear($temperature, globalMin($temperature), globalMax($temperature)), [blue, red])
 color: ramp($temperature, [blue, red])
 ```
 ```CARTOVL_Viz
 // the same as above due to implicit casts
 color: ramp(linear($temperature), [blue, red])
 ```
```CARTOVL_Viz
 // the same as the two above due to implicit casts
 color: ramp(linear($temperature, globalMin($temperature), globalMax($temperature)), [blue, red])
 ```
 ```CARTOVL_Viz
 // The data range has been fixed to the [-10, 40] range
 color: ramp(linear($temperature, -10, 40, [blue, red])
 ```
  ```CARTOVL_Viz
  // The data range has been set to avoid taking into account the first 1% of the data and the last 1% of the data
  // For dynamic datasets this is better than the previous fixed approach
 color: ramp(linear($temperature, globalPercentile($temperature, 1), globalPercentile($temperature, 99), [blue, red])
 ```

 TODO add implicit cast to glossary
 TODO add outliers to glossary

 #### Classifying numerical properties

 Usage of [`linear`](https://carto.com/developers/carto-vl/reference/#cartoexpressionslinear) reduces the loss of precision compared to the usage of classifiers. However, correctly classified data makes easier to detect patterns and improve the perception of the data, since it is difficult to perceive small difference in color or size, which can arise when using [`linear`](https://carto.com/developers/carto-vl/reference/#cartoexpressionslinear).

There are multiple classifying methods (quantiles, equal intervals...) and the classification can be applied to two different samples:
- The entire dataset. `global*` classifiers will apply the classification to the all source data. Ignoring filters or the presence of each feature in the viewport.
- Viewport data. `viewport*` classifiers will apply the classification only to the features that are on the viewport. This includes filtering by the `filter:` styling property and filtering by the checking that the feature is within the region covered by the screen at each moment. Changes on the view (map center / map zoom) will trigger an automatic re-computation of the classification.

Let's see some maps with those. Do you see how `viewport*` classifiers are dynamic and changes in the map bounds change the result?

TODO add example with legend

##### A note about `filter:`

`filter:` is a special styling property. Apart from multiplying the feature's color alpha channel by its value, it is used semantically to filter the dataset, which affects the `viewport*` classifiers and `viewport*` aggregators. When a feature's `filter:` value is above `0.5` we consider that the feature pass the filter, and the feature will be taken into account. When the value is below `0.5`, the feature is ignored (treated as non-existent) in all `viewport*` functions.

### Categorical properties

Of course, not all data is numeric. Sometimes, it's just one value of a fixed number of possible values. For example, in an election map we only have a fixe number of political parties. And in each region, only one party can win. This kind of data is what we call "categorical data".

#### A note about encodings

Within CARTO VL we follow and enforce one condition:
**categorical properties comes from strings in the Source**. This means that if you have a category encoded as a number (for example, giving an ID to each political party), we will treat the property as a number, and functions that expect categorical properties won't work with it. Likewise, numerical properties encoded as strings will be treated as categories and functions that expect numerical properties won't work with them.

As a rule of thumb, if it makes sense to apply numerical functions like addition or multiplication to the data, the data should be stored / encoded as numbers. Otherwise, the data should be stored / encoded as strings.

#### One to one mapping. One category - one color.

To create a one to one mapping between categories and colors (or any other list of values) the simplest function is [`buckets`](https://carto.com/developers/carto-vl/reference/#cartoexpressionsbuckets).

Buckets allows to pick some or all categories from a categorical property in a particular order, allowing `ramp` to match those with the color list. Let's see it with an example:
```CARTOVL_Viz
// Suppose we have an election map with a `winner` property that contains the political party that won the region, like:
// $geom                    $winner
// GeometryOfRegionA        'conservatives'
// GeometryOfRegionB        'progressives'
// ...
//
// We can create a choropleth map by matching the winners of each region to one color by using buckets
// This will create the following correspondence:
//      'conservatives' <=> red
//      'progressives'  <=> red
//      'liberals'      <=> green
color: ramp(buckets($winner, ['conservatives', 'progressives', 'liberals'], [red, blue, green])
```

#### *Others*

When working with categories, the concept of the *others bucket* arises. For example, the buckets function picks some categories, but, what happens with the unselected categories?

In the previous example, we could have regions in which the 'socialist' party won. This category wasn't placed in the `buckets` function, so it will fallback to the `others` bucket.

The `others` bucket will be colored gray by default. However, it's possible to override this behavior by providing a third parameter to `ramp`: `ramp(buckets($winner, ['conservatives', 'progressives', 'liberals'], [red, blue, green], yellow)`.

TODO example

TODO add *others bucket* to the glossary

#### Showing the most common categories: `top`

If we don't care about which colors get each category, but we don't want to color every category in the dataset, we can use `top` to group all uncommon categories in the *others bucket*.

`top($cause, 5)` function will keep the five most common categories (regarding the entire dataset) and will group the rest into the *others bucket*.

TODO example

#### Showing every category without selecting each color

Sometimes, we don't care about the correspondence between colors and categories nor about having too much categories. This is particularly useful for getting quick feedback and exploring a dataset, but it is of reduced utility in later stages.

For this case, we can request to see every category by putting the property as the `ramp` input without enclosing it in a function like `buckets`.

TODO example with `ramp($cat, [yellow, blue, red])`

As you can see, CARTO VL is generating intermediate colors by interpolating the provided colors. This is always done when the provided list of colors doesn't match the number of categories in the input.

##### CieLAB interpolation
The interpolation made by `ramp` is always done in the CieLAB color space. This is very important since interpolation in the sRGB color space is not the same as in the CieLAB color space. The later assures a better perception of color since the CieLAB color space models the way the human eye perceives colors. We see the interpolation of two colors colorA and colorB at 50% in the middle when the interpolation is done in CieLAB, but not necessarily if it's done in sRGB.


## Ramp values

In the previous section we talked about using different types of input for ramp, but we always output colors picked from list. `ramp` supports to use other types of outputs and also includes some fixed constant palettes of colors. Let's see it!

### Color values

One way to output colors is to specify a list of colors, just like we have done in all the previous examples. This can be done with expressions like `ramp($temperature, [blue, red])`. But usage of named colors (`blue`, `red`, `green`...) is not enforced, any valid color expression is ok, for example:
`ramp($temperature, [rgb(200,220,222), rgba(200,120,22, 0.8)])`, `ramp($temperature, [hsv(0,1,1), hsv(0.5,1,1)])`,`ramp($temperature, [#00F, #F00])`, `ramp($temperature, [blue, #F00])`, `ramp($temperature, [opacity(blue, 0.4), opacity( #F00, 0.6),])`

There is another way to specify colors, and that is to use one of the built-in color palettes. We have built-in all the CARTOColors and ColorBrewer palettes. You can use them like this:

ramp($temperature, emrld)
ramp($temperature, tealrose)
ramp($temperature, cb_blues)

The complete list of CARTOColors can be seen [here](https://carto.com/carto-colors/).

### Numeric values / Bubble-maps

When dealing with point data, an interesting visualization is the bubble-map. In a bubble-map each point has a width that depends on an feature property.

Matching between numbers (the feature's data) and other numbers (the point sizes) is a special case because basic math can create the required match without the need for the special function `ramp`. However, using `ramp` facilitates some advanced usages. In the following subsections will see both approaches.

### The `ramp` way

`ramp` can be used in the same way it can be used with colors changing the color values to numbers. With this approach, the same *implicit casts* we talked [before](#Showing-raw-/-unclassified-numerical-data) will be performed.
```
width: ramp($number, [0, 50])
```
file:///home/dmanzanares/github/renderer-prototype/examples/editor/index.html#eyJhIjoibW9uYXJjaF9taWdyYXRpb25fMSIsImIiOiIiLCJjIjoibWFtYXRhYWtlbGxhIiwiZCI6Imh0dHBzOi8ve3VzZXJ9LmNhcnRvLmNvbSIsImUiOiJ3aWR0aDogcmFtcCgkbnVtYmVyLCBbMCwgNTBdKVxuXG5cbmNvbG9yOiBvcGFjaXR5KHJhbXAobGluZWFyKCgkbnVtYmVyKV4wLjUsIDAsIDUwKSwgU3Vuc2V0KSwwLjcpXG5zdHJva2VDb2xvcjogcmFtcChsaW5lYXIoKCRudW1iZXIpXjAuNSwwLCA1MCksIFN1bnNldClcbnN0cm9rZVdpZHRoOiAxXG5cblxuXG5cbiIsImYiOnsibG5nIjotOTAuNTUyMTAzODYzNzM0MiwibGF0IjozNi4yMzI2NTM2ODcxOTUyN30sImciOjMuOTc0MjExNzAxODU5NDMyNywiaCI6IkRhcmtNYXR0ZXIiLCJpIjoiZGF0YXNldCJ9

Classified numerical properties are similar too:
```
width: ramp(globalQuantiles($number, 7), [1, 50])
```


Categorical properties can be used like before too:
```
width: ramp(buckets($cat, 'Salud'), prism)
```

#### Size perception
Using `ramp($number, [0, 50])` works, and it probably works as expected. If $number is a property with a minimum of 0 and a maximum of 300 in the dataset, a feature with `$number=150` is halfway in the `linear` range. Therefore, ramp will output `50%*0+50%*50` (25).

However, this is probably not what you want. The reason for this is that a change of `3x` in width is not perceive as a change of `3x`, because we perceive the change of area, not the change of width, and the change of area when triplicating the width is not a `3x`, but a `9x`. The basic geometry just tells us that the area of a circle is proportional to the square of its radius.

If we don't want to accentuate differences we'll need to take the square root. This can be done with the a little bit uglier:
```
// We'll need to take the square of the output values to specify the widths and not the areas
width: sqrt(ramp($number, [0, 50^2]))
```
Similarly, classifiers can be re-mapped in the same way:
```
width: sqrt(ramp(globalQuantiles($number, 7), [1, 50^2]))
```

### Direct approach when styling by a numerical property

`ramp` is useful because it allows to map most input to most values, interpolating the values if needed and providing implicit casts if they are convenient. However, it can be overkill when the matching is done from a numerical property to a numeric list.

For this case, using regular math is probably simpler and easier, while having the same, correct, results.

For example, the `ramp` expression `width: ramp(sqrt(linear($number)), [0, 50])` is equivalent to `width: sqrt($number/globalMax($number))*50`. And since sometimes we don't want to normalize by the maximum value in the dataset, this could be reduced further to get `width: sqrt($number)`.

TODO example with the 3 approaches

### Images values

The last supported type of value for `ramp` is the `Image` type. Let's see some examples:

```
color:  ramp(buckets($category, ['Salud', 'Moda y calzado']), [
    green,
    red
])
width: 30
symbol: ramp(buckets($category, ['Salud', 'Moda y calzado']), [
    image('../styling/marker.svg'),
    image('../styling/star.svg')
])
```

As you can see, the features that weren't specified in the `buckets` list received the color gray and were represented with circles. As discussed above, this *others bucket* receive default values, but they can be overridden, even when working with images. Let's see that:
```
color:  ramp(buckets($category, ['Salud', 'Moda y calzado']), [
    green,
    red
], white)
width: 30
symbol: ramp(buckets($category, ['Salud', 'Moda y calzado']), [
    image('../styling/marker.svg'),
    image('../styling/star.svg')
], car)
```

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
