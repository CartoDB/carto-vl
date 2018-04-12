## About this Guide

This guide walks through making a variety of common thematic map types with lines.

## Basic Styling Properties

+ Line Width
+ Line Color
+ Line Draw Order

### Line Width

To adjust the line width, use the `width` property.

```
width: 1.5
```

### Line Color
Use the `color` property to color features with one of CARTO VL's supported color spaces.

```
width: 1.5
color: hsv(0.5,1,1)
```

### Line Draw Order

```
order: desc(width())
```

## Color by Value: String
+ Unique Values
+ Most Common Category
+ Attribute Values


### Unique Values  
The map below assigns a unique color to each category value in the `cause_descrip` field using a qualitative CARTOColor scheme `Prism`. By default, features with different `cause_descrip` are not aggregated together. 

```
width: 1.5
color: ramp($direction,vivid)
```

### Most common category

#### Metadata Operator

```
width: 1.5
color: ramp(top($direction,2)vivid)
```

### Attribute Values

To map colors to particular categories, use the classification operator `buckets`.

```
width: 1.5
color: ramp(buckets($direction,"East","West")vivid)
```

## Color and Size by Value: Numbers

+ Classed color
+ Classed size
+ Unclassed color
+ Unlcassed size
+ Manual Classed Color
+ Manual Classed Size		


### Classed Color
Use an available classification method, to group features into a defined set of bins and color them using a sequential color scheme.

TBD

### Classed Size
TBD

### Unclassed Color

```
width: 1.5
color: ramp(linear($strahler,0,10),ag_sunset)
```
## Unlcassed Size

### Mathematical Operator
```
width: sqrt($total_pop/10000)
color: hsv(0.6,0.6,1)
```

### Attribute Value
```
width: $diameter/10
color: hsv(0.4,0.5,0.8)
```

### Blend Operator
```
width: blend(5,20,$gis_acres/10000)
```

### Manually Classed Color

```
color: ramp(buckets($price,50,100,500,1000),sunset)
```

### Manually Classed Size
TBD 