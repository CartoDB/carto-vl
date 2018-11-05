## Data-driven visualizations (part 2): Ramp values

In the previous section we talked about using different types of inputs for ramp, but we always output colors picked from a list. `ramp` supports to use other types of outputs and also CARTO VL includes some fixed constant palettes of colors. Let's see it!

### Color values

One way to output colors is to specify a list of colors, just like we have done in all the previous examples. This can be done with expressions like `ramp($dn, [blue, red])`. But usage of named colors (`blue`, `red`, `green`...) is not enforced, any valid color expression is ok, for example:
- `ramp($dn, [rgb(200,220,222), rgba(200,120,22, 0.8)])`
- `ramp($dn, [hsv(0,1,1), hsv(0.5,1,1)])`
- `ramp($dn, [#00F, #F00])`
- `ramp($dn, [blue, #F00])`
- `ramp($dn, [opacity(blue, 0.4), opacity( #F00, 0.6),])`

There is also another way to specify colors, and that is to use one of the built-in color palettes. We have built-in all the CARTOColors and ColorBrewer palettes. You can use them like this:
- `ramp($dn, temps)`
- `ramp($dn, tealrose)`
- `ramp($dn, cb_blues)`

The complete list of CARTOColors can be seen [here](https://carto.com/carto-colors/).

Let's see all these options in actions!

<div class="example-map">
    <iframe
        id="guides-data-driven-2-step-1"
        src="/developers/carto-vl/examples/maps/guides/data-driven-viz-2/population-density-colors.html"
        width="100%"
        height="1000"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
    <a href="/developers/carto-vl/examples#example-population-density---colors">View my source code!</a>
</div>

### Numeric values / Bubble-maps

When dealing with point data, an interesting visualization is the bubble-map. In a bubble-map, each point has a width that depends on a feature property.

Matching between numbers (the feature's data) and other numbers (the point sizes) is a special case because basic math can create the required match without the need for the special function `ramp`. However, using `ramp` facilitates some advanced usages. In the following subsections we'll see both approaches, learning how to create bubble maps like this:
<div class="example-map">
    <iframe
        id="guides-data-driven-2-step-2"
        src="/developers/carto-vl/examples/maps/guides/data-driven-viz-2/accidents-bubblemap.html"
        width="100%"
        height="900"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples/#example-railroad-accidents---bubble-map">View my source code!</a>

#### The `ramp` way

`ramp` can be used in the same way it can be used with colors by replacing the colors with numbers. With this approach, the same [*implicit casts*](/developers/carto-vl/guides/Glossary/) we talked before will be performed.
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
Using `ramp($number, [0, 50])` works, and it probably works as expected. If `$number` is a property with a minimum of 0 and a maximum of 300 in the dataset, a feature with `$number=150` is halfway in the `linear` range. Therefore, ramp will output `50%*0+50%*50` (25).

However, this is probably not what you want. The reason for this is that a change of `3x` in width is not perceive as a change of `3x`, because we perceive the change of area, not the change of width, and the change of area when triplicating the width is not a `3x`, but a `9x`. Basic geometry tells us that the area of a circle is proportional to the square of its radius.

If we don't want to accentuate differences we'll need to take the square root. This can be done with:
```
// We'll need to take the square of the output values to specify the widths and not the areas
width: sqrt(ramp($number, [0, 50^2]))
```
Similarly, classifiers can be re-mapped in the same way:
```
width: sqrt(ramp(globalQuantiles($number, 7), [1, 50^2]))
```

#### Direct approach when styling by a numerical property

`ramp` is useful because it allows mapping most input to most values, interpolating the values if needed and providing implicit casts if they are convenient. However, it can be overkill when the matching is done from a numerical property to a numeric list.

For this case, using regular math is probably simpler and easier, while having the same, correct, results.

For example, the `ramp` expression `width: ramp(sqrt(linear($number)), [0, 50])` is equivalent to `width: sqrt($number/globalMax($number))*50`. And since sometimes we don't want to normalize by the maximum value in the dataset, this could be reduced further to get `width: sqrt($number)`.

### Images values

The last supported type of value for `ramp` is the `Image` type. Let's see some examples:

<div class="example-map">
    <iframe
        id="guides-data-driven-2-step-3"
        src="/developers/carto-vl/examples/maps/styling/image-multiple.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
<a href="/developers/carto-vl/examples/#example-multiple-images">View my source code!</a>

As you can see, the features that weren't specified in the `buckets` list received the color gray and were represented with circles. As discussed above, this *others bucket* receive default values, but they can be overridden, even when working with images. Let's see that:
```
symbol: ramp(buckets($featurecla, ['Admin-0 capital','Admin-1 capital','Populated place']), [star,triangle,marker], square)
```
