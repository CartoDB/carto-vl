## Data-driven visualizations (Part 1)

### What is a ramp?

The most common expression you will use for data-driven visualizations is [`ramp`](/developers/carto-vl/reference/#cartoexpressionsramp) a special CARTO VL expression that outputs values based on an input. 

Depending on the type of input the matching output will be performed in different ways:
- **One-to-one**: is performed when the number of possible categories in the input matches the number of values    
`ramp(buckets($winner, ["Conservative Party", "Labour Party"]), [blue, red])` will set conservatives blue, and progressives red
- **Interpolation**: is performed when there isn't a one-to-one match allowing intermediate values to be created automatically: 
`color: ramp($population_density, [green, yellow, red])` will assign the color green to features with a low population density and red to the ones with high population density. Intermediate population densities will get colored based on the interpolation between green, yellow and red based on how close a value is to the lowest and highest values in the dataset.

To introduce the use of `ramp`, this guide covers using them with the styling property `color`. `ramp` values don't always have to be colors. `ramp` gives you the ablitiy to create a variety of map types like bubble, flow, and more which we will explore in more detail in [Part 2](/developers/carto-vl/guides/data-driven-visualizations-part-2/) of this guide.


We've talked about how [`ramp`](/developers/carto-vl/reference/#cartoexpressionsramp) can be used to match *inputs* with *values*. In general, `ramp` allows matching most types of inputs with most types of values. But, the common case is to match a property as the input to fixed constant outputs like colors. This is what we call **style by value**.

The following sections will cover **style by value** with different property types. For example, when dealing with a transaction dataset we could style by numeric data like the amount of each payment, or by categorical data like the method of payment (credit card, cash, etc.).

### Numeric properties

#### Symbolizing unclassed numeric data

Going back to our previous example, it's common to want to map a continuous range of numeric data, like population density, to a continuous range of colors, for example, the range of colors between black and yellow. This is straight-forward with CARTO VL.

This styling below will map the feature with the lowest population density in the source data to *midnight blue* and the feature with the highest population density to *gold*:

```CARTOVL_Viz
color: ramp($population_density, [midnightblue, gold])
```

<div class="example-map" style="margin: 20px auto !important">
    <iframe
        id="population-density-unclassed"
        src="/developers/carto-vl/examples/maps/guides/ramp/population-density-unclassed.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples#example-population-density---unclassed">View my source code!</a>

To see more variation in the data, you can even set intermediate colors in the color list, for example:

```CARTOVL_Viz
color: ramp($population_density, [midnightblue, deeppink, gold])
```  

Matching the input with the context of the lowest population density and highest population density is done by the [`linear`](/developers/carto-vl/reference/#cartoexpressionslinear) function, which is used automatically by `ramp` when the input is a numeric property. This means that the CARTO VL `ramp` function makes transformations that we call *implicit casts*.

Use the map below to toggle between the following examples of *implicit casts*:

* **Style 1** (`ramp($population_density, [midnightblue, deeppink, gold])`) will be implicitly cast to 
* **Style 2** (`ramp(linear($population_density), [midnightblue, deeppink, gold])`) which will be implicitly cast to 
* **Style 3** (`ramp(linear($population_density, globalMin($population_density), globalMax($population_density)), [midnightblue, deeppink, gold])`) 

Since these transformations are happening, as you switch between styles, you will notice that the map does not change.

<div class="example-map" style="margin: 20px auto !important">
    <iframe
        id="population-density-basic"
        src="/developers/carto-vl/examples/maps/guides/ramp/population-density-basic.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples#example-population-density---basic">View my source code!</a>


#### Overriding the default range to avoid outliers

The [`linear`](/developers/carto-vl/reference/#cartoexpressionslinear) function has another *implicit cast*. When `linear` is called with only one parameter (as seen in **Style 2** above) it will transform it to what we see in **Style 3** above (`linear($population_density, globalMin($population_density), globalMax($population_density))`). The second and third parameters of `linear` (`globalMin()` and `globalMax()`) are what set the values of the lowest and highest population densities for `ramp`.

It is common for datasets to have [outliers](https://en.wikipedia.org/wiki/Outlier) with values that are very far away from the norm. There are times where you will want to "ignore" these outliers when computing a `ramp`. With CARTO VL, this can be done by manually setting the second and third parameters of `linear` to the minimum and maximum values of the data range you are interested in.

Use the map below to toggle between examples of *implicit casts* and explicit linear ranges:

<div class="example-map" style="margin: 20px auto !important">
    <iframe
        id="population-density-basic"
        src="/developers/carto-vl/examples/maps/guides/ramp/population-density-basic.html"
        width="100%"
        height="1000"
        frameBorder="0">
    </iframe>
    <a href="/developers/carto-vl/examples#example-population-density---basic">View my source code!</a>
</div>

#### Classifying numeric properties

 Usage of [`linear`](/developers/carto-vl/reference/#cartoexpressionslinear) reduces the loss of precision compared to the usage of classifiers. However, correctly classified data makes easier to detect patterns and improve the perception of the data, since it is difficult to perceive small differences in color or size, which can arise when using [`linear`](/developers/carto-vl/reference/#cartoexpressionslinear).

There are multiple classification methods (quantiles, equal intervals...) and the classification can be applied to two different samples:
- The entire dataset. `global*` classifiers will apply the classification to all source data. Ignoring filters or the presence of each feature in the viewport.
- Viewport data. `viewport*` classifiers will apply the classification only to the features that are on the viewport. This includes filtering by the `filter:` styling property and filtering by checking that the feature is within the region covered by the screen at each moment. Changes in the view (map center/map zoom) will trigger an automatic re-computation of the classification.

On top on that, you can also classify the data by a fixed list of breakpoints with the [`buckets()`](/developers/carto-vl/reference/#cartoexpressionsbuckets) function. For example, the expression `buckets($price, [10, 200])` will classify the features by its price into 3 different categories (buckets): the features that have a price less than 10, the features that have a price between 10 and 200, and the features that have a price higher than 200. It's important to note that there is always one more category than breakpoints. The `buckets` function can also be used with categorical inputs, we'll see that on the [next section](####\ One\ to\ one\ mapping).

Let's see some maps with those. Do you see how `viewport*` classifiers are dynamic and changes in the map bounds change the result?

<div class="example-map" style="margin: 20px auto !important">
    <iframe
        id="population-density-classified"
        src="/developers/carto-vl/examples/maps/guides/ramp/population-density-classified.html"
        width="100%"
        height="1000"
        frameBorder="0">
    </iframe>
    <a href="/developers/carto-vl/examples#example-population-density---classification">View my source code!</a>
</div>

**Note:**
**`filter`**
`filter:` is a special styling property. Apart from multiplying the feature's color alpha channel by its value, it is used semantically to filter the dataset, which affects the `viewport*` classifiers and `viewport*` aggregators. When a feature's `filter:` value is above `0.5` we consider that the feature pass the filter, and the feature will be taken into account. When the value is below `0.5`, the feature is ignored (treated as non-existent) in all `viewport*` functions.

### Categorical properties

Of course, not all data is numeric. Sometimes, it's just one value of a fixed number of possible values. For example, in an election map, we only have a fixed number of political parties. And in each region, only one party can win. This kind of data is what we call *categorical data*.

We'll talk here about:
- [Encodings](#A_note_about_encodings)
- [One to one mapping](#One_to_one_mapping._One_category_-_one_color.)
- [Others bucket](#*Others*)
- [Showing the most common categories](#Showing_the_most_common_categories:_`top`)
- [Showing every category](#Showing_every_category_without_selecting_each_color)
- [CieLAB interpolation](#_CieLAB_interpolation)

**Note:**
**About Encodings**
Within CARTO VL we follow and enforce one condition:
**categorical properties come from strings in the Source**. This means that if you have a category encoded as a number (for example, giving an ID to each political party), we will treat the property as a number, and functions that expect categorical properties won't work with it. Likewise, numerical properties encoded as strings will be treated as categories and functions that expect numerical properties won't work with them.

As a rule of thumb, if it makes sense to apply numerical functions like addition or multiplication to the data, the data should be stored/encoded as numbers. Otherwise, the data should be stored/encoded as strings.

#### One to one mapping

To create a one to one mapping between categories and colors (or any other list of values) the simplest function is [`buckets`](/developers/carto-vl/reference/#cartoexpressionsbuckets).

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
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
<div style="margin-bottom: 20px !important">
   <a href="/developers/carto-vl/examples#example-election---basic">View my source code!</a>
</div>

#### *Others*

When working with categories, the concept of the *others bucket* arises. For example, the buckets function picks some categories, but, what happens with the unselected categories?

In the previous example, we could have regions in which the 'socialist' party won. This category wasn't placed in the `buckets` function so it will fall back to the `others` bucket.

The `others` bucket will be colored gray by default. However, it's possible to override this behavior by providing a third parameter to `ramp`: `ramp(buckets($winner, ['conservatives', 'progressives'], [red, blue], white)`.

<div class="example-map">
    <iframe
        id="election-others-bucket"
        src="/developers/carto-vl/examples/maps/guides/ramp/election-others-bucket.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
    <a href="/developers/carto-vl/examples#example-election---others-bucket">View my source code!</a>
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
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
    <a href="/developers/carto-vl/examples#example-railroad-accidents---top-expression">View my source code!</a>
</div>

#### Showing every category without selecting each color

Sometimes, we don't care about the correspondence between colors and categories nor about having too many categories. This is particularly useful for getting quick feedback and exploring a dataset, but it is of reduced utility in later stages.

For this case, we can request to see every category by putting the property as the `ramp` input without enclosing it in a function like `buckets`.

<div class="example-map">
    <iframe
        id="accidents-all"
        src="/developers/carto-vl/examples/maps/guides/ramp/accidents-all.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
    <a href="/developers/carto-vl/examples#example-railroad-accidents---all-types">View my source code!</a>
</div>

As you can see, CARTO VL is generating intermediate colors by interpolating the provided colors. This is always done when the provided list of colors doesn't match the number of categories in the input. It's difficult to distinguish colors when there are so many categories, you should try to avoid this form (to use `buckets` or `top`) when this happens.

**Note:**
**CieLAB interpolation**
The interpolation made by `ramp` is always done in the CieLAB color space. This is very important since interpolation in the sRGB color space is not the same as in the CieLAB color space. The later assures a better perception of color since the CieLAB color space models the way the human eye perceives colors. We see the interpolation of two colors colorA and colorB at 50% in the middle when the interpolation is done in CieLAB, but not necessarily if it's done in sRGB.
