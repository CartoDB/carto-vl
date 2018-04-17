# Color guide

## Fixed colors
CARTO VL offers expression 5 color expressions:

- Named
- Hexadecimal
- RGB/RGBA
- HSV/HSVA
- CieLab

### Named colors
A `named color` is a fixed color that doesn't change with time. [See the full list of color names here](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#colors_table)

```
color: red
```

### Hexadecimal
An `hexadecimal color` represents a color with its hexadecimal notation (`#RRGGBB`) where R (red), G (green) and B (blue) are hexadecimal characters (0-9, A-F).

```
color: #ff0000
```

### RGB / RGBA
A `rgb/rgba color` represents a color using a rgb function.

- `rgb(r, g, b):` receives numeric expressions evaluated from 0 to 255 
    - r: is a numeric expression that indicates the red amount from 0 to 255
    - g: is a numeric expression that indicates the green amount from 0 to 255
    - b: is a numeric expression that indicates the blue amount from 0 to 255

```
color: rgb(255, 0, 0)
```

- `rgba(r, g, b, a):` receives numeric expressions evaluated from 0 to 255 for the colors and a numeric expression evaluated from 0 to 1 for the alpha.
    - r: is a numeric expression that indicates the red amount from 0 to 255
    - g: is a numeric expression that indicates the green amount from 0 to 255
    - b: is a numeric expression that indicates the blue amount from 0 to 255
    - a: is a numeric expression that indicates the alpha amount from 0 to 1

```
color: rgb(255, 0, 0, 1)
```

### HSV / HSVA
A `hsv` color represents a color using a [hsv function](https://en.wikipedia.org/wiki/HSL_and_HSV).

- `hsv(h, s, v)`
    - h: is a numeric expression that indicates the hue from 0 to 1
    - s: is a numeric expression that indicates the saturation from 0 to 1
    - v: is a numeric expression that indicates the value from 0 to 1

```
color: hsv(0, 1, 1)
```

- `hsva(h, s, v, a)`
    - h: is a numeric expression that indicates the hue from 0 to 1
    - s: is a numeric expression that indicates the saturation from 0 to 1
    - v: is a numeric expression that indicates the value from 0 to 1
    - a: is a numeric expression that indicates the alpha value from 0 to 1

```
color: hsva(0, 1, 1, 0)
```

### HSL / HSLA
A `hsl` color represents a color using a [hsl function](https://en.wikipedia.org/wiki/HSL_and_HSV).

- `hsv(h, s, l)`
    - h: is a numeric expression that indicates the hue from 0 to 1
    - s: is a numeric expression that indicates the saturation from 0 to 1
    - l: is a numeric expression that indicates the [lightness](https://en.wikipedia.org/wiki/HSL_and_HSV#Lightness) from 0 to 1

```
color: hsl(0, 1, 0.5)
```

- `hsva(h, s, l, a)`
    - h: is a numeric expression that indicates the hue from 0 to 1
    - s: is a numeric expression that indicates the saturation from 0 to 1
    - l: is a numeric expression that indicates the [lightness](https://en.wikipedia.org/wiki/HSL_and_HSV#Lightness) from 0 to 1
    - a: is a numeric expression that indicates the alpha value from 0 to 1

### CIELAB
A `cielab` color represents a color using a [CIELAB function](https://en.wikipedia.org/wiki/Lab_color_space#CIELAB).

- `cielab(l, a, b)`
    - l: is a numeric expression that indicates the lightness from 0 to 100
    - a: is a numeric expression that indicates the (green-red) value from -128 to 128
    - b: is a numeric expression that indicates the (blue-yellow) value from -128 to 128

```
color: cielab(53, 80, 67)
```



## Variable colors

You can use an expression whenever you want, this means you can pass a `property` 

Example: Higher prices will be more red.

```
color: rgba($price, 0, 0)
```

For an advanced styling see [TODO]

