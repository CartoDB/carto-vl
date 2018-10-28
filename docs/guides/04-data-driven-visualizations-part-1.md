## Data-driven visualizations (Part 1)

### What is a ramp?

The most common expression you will use for data-driven visualizations is [`ramp`](/developers/carto-vl/reference/#cartoexpressionsramp) a special CARTO VL expression that outputs *values* based on an *input*. 

Depending on the type of input, the matching output is performed in two different ways:
- **One-to-one**: is performed when the number of possible categories in the input matches the number of values.
- **Interpolation**: is performed when there isn't a one-to-one match and intermediate values are created automatically.

Throughout this guide, you will explore different ways to use [`ramp`](/developers/carto-vl/reference/#cartoexpressionsramp) to match *inputs* to *values*. The most common use case is to match a property in your data as the input to fixed constant outputs like color or size. This is what we call **style by value**.

The following sections will cover **style by value** for different data properties and map types. For example, by the end of this guide, you will better understand the options available when dealing with something like a transaction dataset and how to style by numeric data like the amount of each payment, or by categorical data like the method of payment (credit card, cash, etc.).

**Note**
To introduce the use of `ramp`, this guide covers use-cases with the styling property `color`. `ramp` values don't always have to be colors. `ramp` gives you the ablitiy to create a variety of map types like bubble, flow, and more which we will explore in more detail in [Part 2](/developers/carto-vl/guides/data-driven-visualizations-part-2/) of this guide.

### Numeric properties

#### Unclassed maps

It is common to want to map a continuous range of numeric data, like population density, to a continuous range of colors, for example, the range of colors between black and yellow. This is straight-forward with CARTO VL.

The style below assigns the feature with the lowest population density in the source data to `midnightblue` and the feature with the highest population density to `gold`. Intermediate population densities are colored based on the interpolation between `midnightblue` and `gold` based on how close a value is to the lowest and highest values in the dataset.

```CARTO_VL_Viz
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

To see more variation in the data, you can even set intermediate colors in the color list for example, here we are adding an intermediate color, `deeppink`:

```CARTO_VL_Viz
color: ramp($population_density, [midnightblue, deeppink, gold])
```  
#### Implicit casts

Matching the input with the context of the lowest population density and highest population density is done by the [`linear`](/developers/carto-vl/reference/#cartoexpressionslinear) function, which is used automatically by `ramp` when the input is a numeric property. This means that the CARTO VL `ramp` function makes transformations that we call *implicit casts*.

Use the map below to toggle between three styles. You will notice that the map does not change since **Style 1** is implicity cast to **Style 2** which is implicitly cast to **Style 3**, making them all equal. In the following section, you will see how to take advantage of this behavior to further customize your map.

```CARTO_VL_Viz
// Style 1: this will be implicitly cast to Style 2

color: ramp($population_density,[midnightblue, deeppink, gold])

// Style 2: will be implicitly cast to Style 3

color: ramp($population_density, [midnightblue, deeppink, gold])

// Style 3

color: ramp(linear($population_density, globalMin($population_density), globalMax($population_density)), [midnightblue, deeppink, gold])
```

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

#### Explicit ranges

When `linear` is called with only one parameter (as seen in **Style 2** above), it will transform to what we see in **Style 3**: 

```CARTO_VL_Viz
color: linear($population_density, globalMin($population_density), globalMax($population_density))
``` 

The second and third parameters of `linear` (`globalMin()` and `globalMax()`) are what set the values of the lowest and highest population densities for `ramp`.

It is common for datasets to have [outliers](https://en.wikipedia.org/wiki/Outlier) with values that are very far away from the norm. There are times where you will want to "ignore" these outliers when computing a `ramp`. With CARTO VL, this can be done by manually setting *explicit ranges* for the second and third parameters of `linear` to the minimum and maximum values of the data range you are interested in.

In the map below, as you toggle between styles, you will notice how **Style 4** and **Style 5** change based on the modifications made to second (minimum) and third (maximum) parameters.

```CARTO_VL_Viz
// Style 3: equivalent to Style 3 above
color: ramp(linear($dn, globalMin($dn), globalMax($dn)), [midnightblue, deeppink, gold])

// Style 4: the data range has been fixed to the [0, 160] range
color: ramp(linear($dn, 0, 160), [midnightblue, deeppink, gold])

// Style 5: the data range has been set to avoid taking into account the first 1% of the data and the last 1% of the data
color: ramp(linear($dn, globalPercentile($dn, 1), globalPercentile($dn, 99)), [midnightblue, deeppink, gold])
```

<div class="example-map" style="margin: 20px auto !important">
    <iframe
        id="population-density-basic"
        src="/developers/carto-vl/examples/maps/guides/ramp/population-density-outliers.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples#example-population-density---outliers">View my source code!</a>

#### Classed numeric data

Usage of [`linear`](/developers/carto-vl/reference/#cartoexpressionslinear) reduces the loss of precision compared to the usage of classifiers. However, correctly classified data makes it easier to detect patterns in data since it is difficult to perceive small differences in color or size, which can arise when using [`linear`](/developers/carto-vl/reference/#cartoexpressionslinear).

There are multiple classification methods aviailable in CARTO VL (quantiles, equal intervals and standard deviation). These classification methods can be applied using two different samples of data:
- **The entire dataset**. `global*` classifiers will apply the classification to all source data. Ignoring filters or the presence of each feature in the viewport.
- **Data in the viewport**. `viewport*` classifiers will apply the classification only to the features that are in the viewport. This includes filtering by the `filter` styling property and filtering by checking that the feature is within the region covered by the screen at each moment. Changes in the view (map center/map zoom) will trigger an automatic re-computation of the classification.

**Note**
Learn more about using `global*` and `viewport*` methods in the Aggregations guide.

Use the map below to see how classification of data varies between these two sample types:

```CARTO_VL_Viz
// Style 1: Quantiles with 3 class breaks (global). The first bucket contains the lower 33% of the data, the second the middle 33%, and the third, the last 33%.
color: ramp(globalQuantiles($dn, 3), [midnightblue, deeppink, gold])

// Style 2: Equal intervals with 3 class breaks (global). The range of data is divided by the number of class breaks, giving the common difference.
color: ramp(globalEqIntervals($dn, 3), [midnightblue, deeppink, gold])

// Style 3: Quantiles with 3 class breaks (viewport). 
color: ramp(viewportQuantiles($dn, 3), [midnightblue, deeppink, gold])

// Style 4: Equal Intervals classification equivalent to Style 2 but only using the samples that are shown in the viewport. 
color: ramp(viewportEqIntervals($dn, 3), [midnightblue, deeppink, gold])
```

Do you see how `viewport*` classifiers are dynamic and change the results according to the map bounds? Be sure to keep an eye on the dynamic legend!

<div class="example-map" style="margin: 20px auto !important">
    <iframe
        id="population-density-classified"
        src="/developers/carto-vl/examples/maps/guides/ramp/population-density-classified.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples#example-population-density---classified">View my source code!</a>

You can also classify data with a fixed list of breakpoints (manual classification) with the [`buckets()`](/developers/carto-vl/reference/#cartoexpressionsbuckets) function. For example, the expression `buckets($price, [10, 200])` will classify features, based on their value into 3 different buckets: features that have a price less than 10,features that have a price between 10 and 200, and features that have a price higher than 200. 

It's important to note that there is always one more class break than set breakpoints. The `buckets` function can also be used with categorical inputs, we'll explore that functionality later in this guide.

```CARTO_VL_Viz
// Style 1: Features with population density less than 80 will be set midnightblue, between 80 and 160 will be set deeppink, and greater than 160 will be set gold.
color: ramp(buckets($dn, [80, 160]), [midnightblue, deeppink, gold])
```

<div class="example-map" style="margin: 20px auto !important">
    <iframe
        id="population-density-buckets-numeric"
        src="/developers/carto-vl/examples/maps/guides/ramp/population-density-buckets.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples#example-population-density---buckets">View my source code!</a>

**Note:**
**`filter:`** is a special styling property. Apart from multiplying the feature's color alpha channel by its value, it is used semantically to filter the dataset, which affects the `viewport*` classifiers and `viewport*` aggregators. When a feature's `filter:` value is above `0.5` we consider that the feature pass the filter, and the feature will be taken into account. When the value is below `0.5`, the feature is ignored (treated as non-existent) in all `viewport*` functions.

### Categorical data

Of course, not all data is numeric. Sometimes, it's just one value of a fixed number of possible values. For example, in an election map, there are a fixed number of political parties. And in a geographic region, only one party can win. This is what we refer to as *categorical data*.

In the section, we will explore a variety of ways to symbolize categorical data:
* **One to one mapping**: match specific categories to specific colors.
* **Other categories**: color unspecified categories.
* **Color most common categories**: using the `top` function.
* **Color all categories**: with interpolation.

**Note:**
Before starting with your category map, it is important to note that in CARTO VL **only string properties in the Source are considered categorical**. This means that if you have a category encoded as a number, it is treated as a number. Therefore, functions that expect categorical properties won't work. Likewise, numerical properties encoded as strings will be treated as categories and functions that expect numerical properties won't work. As a rule of thumb, in CARTO VL, if you want to apply numeric functions (addition or multiplication), the property should be stored/encoded as numbers.

#### One-to-one mapping

To assign a specific color to a specific category (or any other list of values) in your data, use the [`buckets`](/developers/carto-vl/reference/#cartoexpressionsbuckets) function.

Using `buckets` you can pick some or all categories from a property. You can list them in a particular order, and use `ramp` to do a one-to-one match between those categories and an associated list of colors. 

The map below is a categorical map of election results in the UK. Using a field ($winner),regions where the Conseravative Party won are colored `royalblue` and regions where the Labour Party won are colored `crimson`. These two parties are matched to their unique color using `buckets`:

```CARTO_VL_Viz
// Color regions where the conservatives won blue and progressives red
color: ramp(buckets($winner, ["Conservative Party", "Labour Party"]), [royalblue, crimson])
```
<div class="example-map" style="margin: 20px auto !important">
    <iframe
        id="election-basic"
        src="/developers/carto-vl/examples/maps/guides/ramp/election-basic.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples#example-election---basic">View my source code!</a>

#### Other categories

In the map above, any region where a party other than Conservative or Labour won is colored `gray` by default. This is because in the data, there are additional political parties. 

Since the other winning parties weren't placed in the `bucket` function list, they are automatically assigned to a `others` bucket. Once you use `buckets` any category that isn't explicitly defined, will be sent to this bucket. If you want to display more categories, you can add them to the list and assign them a color. 

If you want to overwrite the defualt `others` color (`gray`), you can add a third parameter to `ramp`. In this case, all other parties will be colored `orange`:

```CARTO_VL_Viz
// Overwrite the default others color to orange
ramp(buckets($winner, ['conservatives', 'progressives'], [royalblue,crimson], orange)
```
<div class="example-map" style="margin: 20px auto !important">
    <iframe
        id="election-others-bucket"
        src="/developers/carto-vl/examples/maps/guides/ramp/election-others-bucket.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples#example-election---others-bucket">View my source code!</a>

#### Color most common categories

Another useful function for coloring categorical data is `top`. `top` allows you to select a number of most commonly occuring categories in a dataset and assign them a color. Similar to the scenario above, any other category is assigned to the `others` bucket. 

The map below visually summarizes the top three most common weather conditions for rail accidents in the US between the years of 2010-2014 using the `top` function. The top three categories are matched to the listed colors (darkorange,darkviolet,darkturquoise) and all other weather conditions are colored `white` in the *others* bucket:

```CARTO_VL_Viz
color: ramp(top($weather, 3), [darkorange,darkviolet,darkturquoise], white)
```

<div class="example-map" style="margin: 20px auto !important">
    <iframe
        id="accidents-top"
        src="/developers/carto-vl/examples/maps/guides/ramp/accidents-top.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples#example-railroad-accidents---top-expression">View my source code!</a>

#### Color all categories with interpolation

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
