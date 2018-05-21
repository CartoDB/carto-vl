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

### Cluster Resolution
Points are clustered within the defined resolution and the placement of the point is based on the properties of all points in the defined cluster resolution.

```
width: 5
resolution: 5
```

### Color by category
The map below assigns a unique color to each category value in the `cause_descrip` field using a qualitative CARTOColor scheme `Prism`. By default, features with different `cause_descrip` are not aggregated together.

```
width: 5
color: ramp($commodity_name,Prism)
```

### Most common category

To color features by the most common category, you can use a metadata operator an aggregation operator.

#### Metadata Operator
The map below uses the metadata operator `top` to retrieve the top 4 values in the `commodity_name` field. Each category is colored with a unique color and all other features are colored as other.

### Resolution
Use the `resolution` property to take advantage of the potential of [CARTO aggregations](TODO).

Aggregations will cluster the number of visible points depending on the zoom level increasing the performance and map visibility.

```
width: 5
color: ramp(MODE($commodity_name),Prism)
```

### Attribute Values

To map colors to particular categories, use the classification operator `buckets`.

The map below colors fires that were caused by `Lightning` or `Arson` and all other categories are colored as other.

```
width: 5
color: ramp(buckets($commodity_name,"SOYBEANS","RICE","WHEAT"),Prism)
```

## Color and Size by Value: Numbers
There are a variety of ways to symbolize points using numeric attributes.

+ Classed color
+ Classed size
+ Unclassed color
+ Unlcassed size
+ Manual Classed Color
+ Manual Classed Size


### Classed Color
Use an [available classification method](LINK), to group features into a defined set of bins and color them using a sequential color scheme.

```
width:  3
color: ramp(globalQuantiles($total_pop,5),Emrld)
```
![screen shot 2018-02-15 at 2 59 39 pm](https://user-images.githubusercontent.com/1566273/36283177-e2bb2aee-1260-11e8-9a48-147b2a193a0a.png)

### Classed Size
TBD

### Unclassed Color

```
width: 3
color: ramp(linear($total_pop,1000,500000),ag_sunset)
```
![screen shot 2018-02-15 at 3 34 18 pm](https://user-images.githubusercontent.com/1566273/36285405-a5c20e98-1268-11e8-9c7a-5598ad0438cd.png)

## Unlcassed Size

### Mathematical Operator
```
width: sqrt($total_pop/10000)
color: hsv(0.6,0.6,1)
```
![screen shot 2018-02-15 at 4 07 23 pm](https://user-images.githubusercontent.com/1566273/36285823-5c0f03da-126a-11e8-9444-2879b3ad9996.png)

### Attribute Value
```
width: $diameter/10
color: hsv(0.4,0.5,0.8)
```
![screen shot 2018-02-15 at 4 06 27 pm](https://user-images.githubusercontent.com/1566273/36285786-374eb2de-126a-11e8-8c0f-00cbc78a1782.png)

### Blend Operator
```
width: blend(5,20,$gis_acres/10000)
```

### Manually Classed Color

```
width: 5
color: ramp(buckets($price,50,100,500,1000),sunset)
```
