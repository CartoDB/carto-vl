## Data-driven visualizations (part 2)

In the [previous guide](/developers/carto-vl/guides/data-driven-visualizations-part-1/) we talked about using different types of inputs for `ramp` that were output to colors picked from a list. In this guide, you will see how `ramp` supports the use of other types of outputs (like numbers and images) as well as CARTO VL's fixed constant palettes of colors.

### Color values

One way to output colors is to specify a list of colors, as demonstrated in [Part 1](/developers/carto-vl/guides/data-driven-visualizations-part-1/) with expressions like `ramp($dn, [blue, red])`. In those examples, you mainly saw the usage of named colors (`blue`, `red`, `green`).

With CARTO VL any valid color expression (not just named colors) can be used:

- `ramp($dn, [rgb(200,220,222), rgba(200,120,22, 0.8)])`
- `ramp($dn, [hsv(0,1,1), hsv(0.5,1,1)]`
- `ramp($dn, [#00F, #F00])`
- `ramp($dn, [blue, #F00])`
- `ramp($dn, [opacity(blue, 0.4), opacity( #F00, 0.6)])`

Another way to specify colors is to use built-in [color schemes](https://carto.com/help/glossary/#colorscheme). CARTO VL, by default, supports the use of both [CARTOColors](https://carto.com/carto-colors/) and [ColorBrewer](http://colorbrewer2.org) schemes.

To access CARTOColors, replace the list of colors with the name of the scheme you want to use:

- `ramp($dn, temps)`
- `ramp($dn, purpor)`

To access ColorBrewer, replace the list of colors with the name of the scheme you want to use appended with `cb_`:

- `ramp($dn, cb_blues)`

You can find scheme names for CARTOColors [here](https://carto.com/carto-colors/) and for ColorBrewer [here](http://colorbrewer2.org).

Use the map below, to switch between various color expressions and color schemes:

```CARTO_VL_Viz
// Style 1: apply colors from a color list of named colors

color: ramp($dn, [green, yellow, red])

// Style 2: apply colors from a color list including "transparent"

color: ramp($dn, [transparent, gray, yellow])

// Style 3: apply colors from a color list with HSV color constructors

color: ramp($dn, [hsv(0,1,1), hsv(0.5,1,1)])

// Style 4: apply color using the CARTOColor scheme "temps"

color: ramp($dn, temps)
```

<div class="example-map">
    <iframe
        id="guides-data-driven-2-step-1"
        src="/developers/carto-vl/examples/maps/guides/data-driven-viz-2/step-1.html"
        width="100%"
        height="700"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
You can explore this map [here](/developers/carto-vl/examples/maps/guides/data-driven-viz-2/step-1.html)

### Numeric values

[Proportional symbols](https://carto.com/help/glossary/#proportionalsymbols) (aka "bubble-maps") are a method of symbolizing points using a numeric property. The symbol size of each point is scaled according to its value in the data.

Matching between numbers (the feature's data) and other numbers (the point sizes) is a special case because basic math can create the required match without the need for the special function `ramp`. However, using `ramp` facilitates some advanced usages.

In the following sections you will see both approaches, and learn how to create proportional symbol maps like the ones below.

```CARTO_VL_Viz
// Style 1: Sets a pixel width of 0 to accidents with the lowest damage amounts and 50 pixels to the highest damage amount

width: ramp($total_damage, [0, 50])

// Style 2: The same as Style 1 for extreme values, but the interpolation is linear in area, not in width. An intermediate value with half the damage of the worst accident will get half the area of the worst (50²/2), but not half its width. Unless you want to accentuate differences, this is usually the proper way to make a bubble map

width: sqrt(ramp($total_damage, [0, 50^2]))

// Style 3: The same as Style 2 since the dataset has accidents with zero damage

width: sqrt($total_damage/globalMax($total_damage))*50)

// Style 4: The Equal Intervals method allows to detect the outliers quickly.

width: ramp(globalEqIntervals($total_damage, 3), [1, 25])
```
<div class="example-map">
    <iframe
        id="guides-data-driven-2-step-2"
        src="/developers/carto-vl/examples/maps/guides/data-driven-viz-2/step-2.html"
        width="100%"
        height="550"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
You can explore this map [here](/developers/carto-vl/examples/maps/guides/data-driven-viz-2/step-2.html)

#### The `ramp` way

`ramp` can be used in the same way with numbers. With this approach, the same [*implicit casts*](/developers/carto-vl/guides/Glossary/) we explored in Part 1, will be performed.
```CARTO_VL_Viz
width: ramp($number, [0, 50])
```

Classified numerical properties are similar too:
```CARTO_VL_Viz
width: ramp(globalQuantiles($number, 7), [1, 50])
```

Categorical properties can be used, although normally, it doesn't make sense to set the width by a categorical property:
```CARTO_VL_Viz
width: ramp(buckets($cat, 'categoryA', 'categoryB'), [1, 50])
```

#### Size perception
Using `ramp($number, [0, 50])` works, and it probably works as expected. If `$number` is a property with a minimum of `0` and a maximum of `300` in the dataset, a feature with `$number=150` is halfway in the `linear` range. Therefore, ramp will output `50%*0+50%*50` (25).

However, this is probably not what you want. The reason for this is that a change of `3x` in width is not perceive as a change of `3x`, because we perceive the change of area, not the change of width, and the change of area when triplicating the width is not a `3x`, but a `9x`. Basic geometry tells us that the area of a circle is proportional to the square of its radius.

If you don't want to accentuate differences you can take the square root of the output values to specify the widths and not the areas:
```CARTO_VL_Viz
width: sqrt(ramp($number, [0, 50^2]))
```
Similarly, classifiers can be re-mapped in the same way:
```CARTO_VL_Viz
width: sqrt(ramp(globalQuantiles($number, 7), [1, 50^2]))
```

#### Direct approach when styling by a numerical property

`ramp` is useful because it allows mapping most input to most values, interpolating the values if needed and providing implicit casts if they are convenient. However, it can be overkill when the matching is done from a numerical property to a numeric list.

For this case, using regular math is probably simpler and easier, while having the same, correct, results.

For example, the `ramp` expression `width: ramp(sqrt(linear($number)), [0, 50])` is equivalent to `width: sqrt($number/globalMax($number))*50`. And since sometimes we don't want to normalize by the maximum value in the dataset, this could be reduced further to `width: sqrt($number)`.

### Image values

The last supported type of value for `ramp` is the `image` type.

The map below, assigns different image markers and colors to two categories in the data (`car` and `bus`). The features labeled "Default" in the legend are ones that weren't specified in the `buckets` list. Because of this, they are symbolized with default image symbology: colored gray with a circle image.

```CARTO_VL_Viz
symbol: ramp(buckets($complaint,['Car','Bus']), [car,bus])
color: ramp(buckets($complaint,['Car','Bus']), [#59ca22,#009fff])
width: 20
```

<div class="example-map">
    <iframe
        id="guides-data-driven-2-step-3"
        src="/developers/carto-vl/examples/maps/guides/data-driven-viz-2/step-3.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>

As discussed above, the *others bucket* receives default values, but they can be overwritten, even when working with images.

In the map below, the defaults are overwritten to `cross` for the image and `gold` for the color:

```CARTO_VL_Viz
symbol: ramp(buckets($complaint,['Car','Bus']), [car,bus], cross)
color: ramp(buckets($complaint,['Car','Bus']), [#59ca22,#009fff], gold)
width: 20
```
<div class="example-map">
    <iframe
        id="guides-data-driven-2-step-4"
        src="/developers/carto-vl/examples/maps/guides/data-driven-viz-2/step-4.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
You can explore this map [here](/developers/carto-vl/examples/maps/guides/data-driven-viz-2/step-4.html)
