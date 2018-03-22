## About this Guide

This guide walks through making a variety of common thematic map types with lines.

## Styling Properties

+ Line Width
+ Line Color
+ Line Draw Order

### Line Width

To adjust the line width, use the `width` property.

```
width: 1.5
```

### Line Color
Use the `color` property to color features with one of CARTO GL's [supported color spaces](LINK).

```
width: 1.5
color: hsv(0.1,1,1)
```

### Line Draw Order

```
order: desc(width())
```

## Color by Value: String
+ Basic Syntax
+ Unique Values
+ Most Common Category
+ Attribute Values

### Basic Syntax

#### Acess Attributes
Whether an attribute is a string or number, append it with a `$` to access:
```
$category (string)
$amount (number)
```
#### Color by Attribute
To color features by a string, use a `ramp()` including the attribute name appended with a `$` and a [CARTOColor Qualitative Scheme](https://github.com/CartoDB/CartoColor/wiki/CARTOColor-Scheme-Names).

`color: ramp($attribute,colorscheme)`

### Unique Values  
The map below assigns a unique color to each category value in the `cause_descrip` field using a qualitative CARTOColor scheme `Prism`. By default, features with different `cause_descrip` are not aggregated together. 

```
width: 1.5
color: ramp($cause_descrip,Prism)
```

### Most common category

#### Metadata Operator

```
width: 1.5
color: ramp(top($cause_descrip,4),Prism)
```

### Attribute Values

To map colors to particular categories, use the [classification operator](https://github.com/CartoDB/renderer-prototype/wiki/Operator-Tables#classification-operators) `buckets`.

The map below colors fires that were caused by `Lightning` or `Arson` and all other categories are colored as other.

```
width: 3
color: ramp(buckets($cause_descrip,"Lightning","Arson"),Prism)
```

## Color and Size by Value: Numbers
There are a variety of ways to symbolize lines using numeric attributes.

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
color: ramp(quantiles($total_pop,5),Emrld)
```

### Classed Size
TBD

### Unclassed Color

```
width: 3
color: ramp(linear($total_pop,1000,500000),ag_sunset)
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
width: 5
color: ramp(buckets($price,50,100,500,1000),sunset)
```

### Manually Classed Size
TBD 