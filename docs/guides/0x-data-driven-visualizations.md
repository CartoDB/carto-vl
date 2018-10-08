# Data-driven visualizations

## What is a ramp?

[`ramp`](https://carto.com/developers/carto-vl/reference/#cartoexpressionsramp) is a special CARTO VL expression that outputs values based on an input. Depending on the type of the input the matching will be performed in different ways:
- One-to-one mapping is performed when the number of possible categories in the input matches the number of values. For example, `ramp(buckets($winner, ["Conservative Party", "Labour Party"]), [blue, red])` will set conservatives blue,
- Interpolation is performed otherwise, this allows to create intermediate values automatically. For example: `color: ramp($population_density, [green, yellow, red])` will assign the color black to the features with low population density and yellow to the ones with a high population density.

<div class="example-map">
    <iframe
        id="election-basic"
        src="/developers/carto-vl/examples/maps/guides/ramp/election-basic.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

<div class="example-map">
    <iframe
        id="population-density-basic"
        src="/developers/carto-vl/examples/maps/guides/ramp/population-density-basic.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

It's easy to create choropleth maps by using `ramp` with colors as the values. However, `ramp` values don't need to be colors, allowing creating different and richer types of maps like bubble-maps. But, for simplicity's sake, we will stick to colors until the [Ramp Values section](#Ramp-values).

## Ramp inputs

On the previous section, we talked about how `ramp` can be used to match *inputs* with *values*. In general, `ramp` allows matching most types of inputs with most types of values. But, the common case is to match a property as the input to fixed constant outputs like colors. This is what we call "Style by value".

The following sections will cover *Style by value* with different property types. For example, when dealing with a transaction dataset we could style by numeric data like the price of each feature, or by categorical data like the method of payment (credit card, cash...).

### Numerical properties

#### Showing unclassified numerical data

Going back to our previous example, it's common to want to map a continuous range of numeric data like population density data, to a continuous range of colors, for example, the range of colors between black and yellow.

This is very easy to do with CARTO VL, as shown before you just need to use:
 ```CARTOVL_Viz
color: ramp($population_density, [black, yellow])
 ```

 This will map the feature with the lowest population density in the Source data to *black* and the feature with the highest population density to *yellow*. You can even set intermediate colors in the color list like `[black, gray, yellow]`.

 Matching the input with the context of the lowest population density and highest population density is actually done by the [`linear`](https://carto.com/developers/carto-vl/reference/#cartoexpressionslinear) function, which is placed automatically by `ramp` when the input is a numeric property. CARTO VL `ramp` function just transforms `ramp($population_density, [green, yellow, red])` to `ramp(linear($population_density), [green, yellow, red])`. These transformations are what we call *implicit casts* and are a common topic in CARTO VL.

#### Overriding the default range and avoiding outliers

 Let's see another *implicit cast*, this time one a little bit more interesting.

 The [`linear`](https://carto.com/developers/carto-vl/reference/#cartoexpressionslinear) function has another *implicit cast*. When linear is called with only one parameter it will transform things like `linear($population_density)` to things like `linear($population_density, globalMin($population_density), globalMax($population_density))`. This is what sets the context of the lowest and highest population densities for `ramp`.

 Sometimes, the data has [outliers](https://en.wikipedia.org/wiki/Outlier) (features with data that is very far away from the norm). In these cases, we may want to ignore them when computing the `ramp`. This can be easily done by manually setting the second and third parameters of linear to the minimum and maximum values of the data range we are interested.

<div class="example-map">
    <iframe
        id="population-density-basic"
        src="/developers/carto-vl/examples/maps/guides/ramp/population-density-basic.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

 #### Classifying numerical properties

 Usage of [`linear`](https://carto.com/developers/carto-vl/reference/#cartoexpressionslinear) reduces the loss of precision compared to the usage of classifiers. However, correctly classified data makes easier to detect patterns and improve the perception of the data, since it is difficult to perceive small differences in color or size, which can arise when using [`linear`](https://carto.com/developers/carto-vl/reference/#cartoexpressionslinear).

There are multiple classifying methods (quantiles, equal intervals...) and the classification can be applied to two different samples:
- The entire dataset. `global*` classifiers will apply the classification to all source data. Ignoring filters or the presence of each feature in the viewport.
- Viewport data. `viewport*` classifiers will apply the classification only to the features that are on the viewport. This includes filtering by the `filter:` styling property and filtering by checking that the feature is within the region covered by the screen at each moment. Changes on the view (map center / map zoom) will trigger an automatic re-computation of the classification.

Let's see some maps with those. Do you see how `viewport*` classifiers are dynamic and changes in the map bounds change the result?

<div class="example-map">
    <iframe
        id="population-density-classified"
        src="/developers/carto-vl/examples/maps/guides/ramp/population-density-classified.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>
##### A note about `filter:`

`filter:` is a special styling property. Apart from multiplying the feature's color alpha channel by its value, it is used semantically to filter the dataset, which affects the `viewport*` classifiers and `viewport*` aggregators. When a feature's `filter:` value is above `0.5` we consider that the feature pass the filter, and the feature will be taken into account. When the value is below `0.5`, the feature is ignored (treated as non-existent) in all `viewport*` functions.

### Categorical properties

Of course, not all data is numeric. Sometimes, it's just one value of a fixed number of possible values. For example, in an election map we only have a fixed number of political parties. And in each region, only one party can win. This kind of data is what we call *categorical data*.

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
//      'conservatives' <=> blue
//      'progressives'  <=> red
color: ramp(buckets($winner, ["Conservative Party", "Labour Party"]), [blue, red])
```
<div class="example-map">
    <iframe
        id="election-basic"
        src="/developers/carto-vl/examples/maps/guides/ramp/election-basic.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

#### *Others*

When working with categories, the concept of the *others bucket* arises. For example, the buckets function picks some categories, but, what happens with the unselected categories?

In the previous example, we could have regions in which the 'socialist' party won. This category wasn't placed in the `buckets` function, so it will fallback to the `others` bucket.

The `others` bucket will be colored gray by default. However, it's possible to override this behavior by providing a third parameter to `ramp`: `ramp(buckets($winner, ['conservatives', 'progressives'], [red, blue], white)`.

<div class="example-map">
    <iframe
        id="election-others-bucket"
        src="/developers/carto-vl/examples/maps/guides/ramp/election-others-bucket.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

#### Showing the most common categories: `top`

If we don't care about which colors get each category, but we don't want to color every category in the dataset, we can use `top` to group all uncommon categories in the *others bucket*.

`top($cause, 5)` function will keep the five most common categories (regarding the entire dataset) and will group the rest into the *others bucket*.

Let's see this with a dataset of US railroad accidents.

<div class="example-map">
    <iframe
        id="accidents-top"
        src="/developers/carto-vl/examples/maps/guides/ramp/accidents-top.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

#### Showing every category without selecting each color

Sometimes, we don't care about the correspondence between colors and categories nor about having too much categories. This is particularly useful for getting quick feedback and exploring a dataset, but it is of reduced utility in later stages.

For this case, we can request to see every category by putting the property as the `ramp` input without enclosing it in a function like `buckets`.

<div class="example-map">
    <iframe
        id="accidents-all"
        src="/developers/carto-vl/examples/maps/guides/ramp/accidents-all.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

As you can see, CARTO VL is generating intermediate colors by interpolating the provided colors. This is always done when the provided list of colors doesn't match the number of categories in the input.

##### CieLAB interpolation
The interpolation made by `ramp` is always done in the CieLAB color space. This is very important since interpolation in the sRGB color space is not the same as in the CieLAB color space. The later assures a better perception of color since the CieLAB color space models the way the human eye perceives colors. We see the interpolation of two colors colorA and colorB at 50% in the middle when the interpolation is done in CieLAB, but not necessarily if it's done in sRGB.


## Ramp values

In the previous section we talked about using different types of input for ramp, but we always output colors picked from a list. `ramp` supports to use other types of outputs and also CARTO VL includes some fixed constant palettes of colors. Let's see it!

### Color values

One way to output colors is to specify a list of colors, just like we have done in all the previous examples. This can be done with expressions like `ramp($dn, [blue, red])`. But usage of named colors (`blue`, `red`, `green`...) is not enforced, any valid color expression is ok, for example:
`ramp($dn, [rgb(200,220,222), rgba(200,120,22, 0.8)])`, `ramp($dn, [hsv(0,1,1), hsv(0.5,1,1)])`,`ramp($dn, [#00F, #F00])`, `ramp($dn, [blue, #F00])`, `ramp($dn, [opacity(blue, 0.4), opacity( #F00, 0.6),])`

There is another way to specify colors, and that is to use one of the built-in color palettes. We have built-in all the CARTOColors and ColorBrewer palettes. You can use them like this:

ramp($dn, temps)
ramp($dn, tealrose)
ramp($dn, cb_blues)


<div class="example-map">
    <iframe
        id="population-density-colors"
        src="/developers/carto-vl/examples/maps/guides/ramp/population-density-colors.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

The complete list of CARTOColors can be seen [here](https://carto.com/carto-colors/).

### Numeric values / Bubble-maps

When dealing with point data, an interesting visualization is the bubble-map. In a bubble-map each point has a width that depends on an feature property.

Matching between numbers (the feature's data) and other numbers (the point sizes) is a special case because basic math can create the required match without the need for the special function `ramp`. However, using `ramp` facilitates some advanced usages. In the following subsections will see both approaches.

In the following subsections we'll learn how to create bubble maps like this:
<div class="example-map">
    <iframe
        id="accidents-bubblemap"
        src="/developers/carto-vl/examples/maps/guides/ramp/accidents-bubblemap.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

#### The `ramp` way

`ramp` can be used in the same way it can be used with colors changing the color values to numbers. With this approach, the same *implicit casts* we talked [before](#Showing-raw-/-unclassified-numerical-data) will be performed.
```
width: ramp($number, [0, 50])
```

Classified numerical properties are similar too:
```
width: ramp(globalQuantiles($number, 7), [1, 50])
```


Categorical properties can be used like before too, although normally, it doesn't make sense to set the width by a categorical property:
```
width: ramp(buckets($cat, 'categoryA', 'categoryB'), [1, 50])
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

#### Direct approach when styling by a numerical property

`ramp` is useful because it allows to map most input to most values, interpolating the values if needed and providing implicit casts if they are convenient. However, it can be overkill when the matching is done from a numerical property to a numeric list.

For this case, using regular math is probably simpler and easier, while having the same, correct, results.

For example, the `ramp` expression `width: ramp(sqrt(linear($number)), [0, 50])` is equivalent to `width: sqrt($number/globalMax($number))*50`. And since sometimes we don't want to normalize by the maximum value in the dataset, this could be reduced further to get `width: sqrt($number)`.

### Images values

The last supported type of value for `ramp` is the `Image` type. Let's see some examples:

<div class="example-map">
    <iframe
        id="image-multiple"
        src="/developers/carto-vl/examples/styling/image-multiple.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

As you can see, the features that weren't specified in the `buckets` list received the color gray and were represented with circles. As discussed above, this *others bucket* receive default values, but they can be overridden, even when working with images. Let's see that:
```
symbol: ramp(buckets($featurecla, ['Admin-0 capital','Admin-1 capital','Populated place']), [star,triangle,marker], square)
```
## Generating legends with ramps

In the previous examples we had displayed multiple legends to better understand the other concepts, but we didn't talked about the legends themselves.

CARTO VL provides some facilities to create legends the advanced `eval()` method, which won't be covered by this guide, and the user friendly `getLegendData()` method, which is what we will use here.

However, in any case, CARTO VL itself doesn't provide functionality to display legends, it provides functionality to built them upon them. CARTO VL provides the necessary data to create the legends, but using that data to draw the legends on the screen is left as a responsibility of the developer. The reason for this is that in this way, you'll be able to customize much more your application.

With that said, we provide some examples of this, so you can base your own legends on CARTO VL examples. Here, we'll explain both: the CARTO VL legend API and the reference examples that use such API.


