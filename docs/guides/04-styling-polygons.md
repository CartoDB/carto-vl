## About this Guide

This guide walks through making a variety of common thematic map types with polygons.

## Styling Properties

+ Color

### Color
Use the `color` property to specify the polygon fill color with one of CARTO VL's [supported color expressions](LINK).


TODO: REVIEW FROM HERE
---

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
color: ramp($cause_descrip,Prism)
```

### Most common category

#### Metadata Operator

```
color: ramp(top($cause_descrip,4),Prism)
```

### Attribute Values

To map colors to particular categories, use the classification operator `buckets`.

The map below colors fires that were caused by `Lightning` or `Arson` and all other categories are colored as other.

```
color: ramp(buckets($cause_descrip,"Lightning","Arson"),Prism)
```

## Color by Value: Numbers
There are a variety of ways to symbolize polygons using numeric attributes.

+ Classed color
+ Unclassed color
+ Manual Classed Color
	

### Classed Color
Use an [available classification method](LINK), to group features into a defined set of bins and color them using a sequential color scheme.

```
color: ramp(quantiles($total_pop,5),Emrld)
```

### Unclassed Color

```
color: ramp(linear($total_pop,1000,500000),ag_sunset)
```

### Manually Classed Color

```
color: ramp(buckets($price,50,100,500,1000),sunset)
```
