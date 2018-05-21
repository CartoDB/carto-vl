## About this Guide

This guide walks you through making a variety of common thematic map types for points.

## Supported Color Spaces

* HEX
* RGB(A)
* Named Colors
* HSV(A)
* HSL(A)
* CIELAB
* CARTOcolors

[Example](http://cartovl-tabs.developers.carto-staging.com/developers/carto-vl/examples/#example-color-spaces)

## Basic Styling Properties

+ Width
+ Color
+ Stroke width
+ Stroke color
+ Cluster resolution
+ Order

### Width

Use the `width` property to adjust the point `diameter` in pixels.

```
width: 5
```

**Warning:**
There is a limitation in the total diameter (fill + stroke)  of **124px**. So a point with a total with of 300px will be resized down to 124px.

### Color
The `color` property indicates the color of the feature fill using one of CARTO VL's supported color spaces.

```
width: 5
color: hsv(0.6,1,1)
```

### Stroke Width
The `strokeWidth` property indicates the size in pixels of the point stroke. The default value is `1`.
The stroke grows from the point diameter in both directions, half to the inside and half to the outside.

```
width: 5
color: hsv(0.6,1,1)
strokeWidth: 0
```

**Warning:**
There is a limitation in the total diameter (fill + stroke)  of **124px**. So a point with a total with of 300px will be resized down to 124px.

### Stroke Color
The `strokeColor` property indicates the color of the point's stroke using one of CARTO VL's supported color spaces.

```
width: 5
color: hsv(0.6,1,1)
strokeWidth: 1
strokeColor: hsv(1,0,1)
```

### Resolution
Use the `resolution` property to take advantage of the potential of [CARTO aggregations](TODO).

Aggregations will cluster the number of visible points depending on the zoom level increasing the performance and map visibility.

```
width: 5
resolution: 5
```
