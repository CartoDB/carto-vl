## About this Guide

This guide walks through making a variety of common thematic map types for points.

## Basic Styling Properties

+ [Point Size](https://github.com/CartoDB/renderer-prototype/wiki/Styling-Points#point-size)
+ [Point Color](https://github.com/CartoDB/renderer-prototype/wiki/Styling-Points#point-color)
+ [Point Stroke Width](https://github.com/CartoDB/renderer-prototype/wiki/Styling-Points#point-stroke-width)
+ [Point Stroke Color](https://github.com/CartoDB/renderer-prototype/wiki/Styling-Points#point-stroke-color)
+ [Cluster Resolution](https://github.com/CartoDB/renderer-prototype/wiki/Styling-Points#cluster-resolution)
+ [Point Draw Order](https://github.com/CartoDB/renderer-prototype/wiki/Styling-Points#point-draw-order)

### Point Size

To adjust the point size, use the `width` property.

```
width: 3
```

![screen shot 2018-02-14 at 2 56 20 pm](https://user-images.githubusercontent.com/1566273/36230312-42eb9d06-1197-11e8-9989-27276334aa13.png)

### Point Color
Use the `color` property to color features with one of CARTO GL's [supported color spaces](LINK).

```
width: 3
color: hsv(0.1,1,1)
```
![screen shot 2018-02-14 at 3 12 01 pm](https://user-images.githubusercontent.com/1566273/36230948-75b88882-1199-11e8-9d60-713c1e3905e3.png)

### Point Stroke Width

```
width: 5
color: hsv(0.1,1,1)
strokeWidth: 1
```
![screen shot 2018-02-26 at 1 25 01 pm](https://user-images.githubusercontent.com/1566273/36693430-80841cf0-1af8-11e8-969d-9effd3bd4537.png)

### Point Stroke Color

```
width: 5
color: hsv(0.1,1,1)
strokeWidth: 1
strokeColor: hsv(1,1,1)
```
![screen shot 2018-02-26 at 1 26 24 pm](https://user-images.githubusercontent.com/1566273/36693502-b2e1d0f2-1af8-11e8-907d-ce5a31e5ddfa.png)

### Cluster Resolution
Points are clustered within the defined resolution and the placement of the point is based on the properties of all points in the defined cluster resolution.

```
width: 5
resolution: 5
```
![screen shot 2018-02-26 at 1 52 36 pm](https://user-images.githubusercontent.com/1566273/36694680-618d0d76-1afc-11e8-8d32-b46cd8337e7f.png)

### Point Draw Order

```
order: desc(width())
```

## Color by Value: String
+ [Basic Syntax](https://github.com/CartoDB/renderer-prototype/wiki/Styling-Points#basic-syntax)
+ [Unique Values](https://github.com/CartoDB/renderer-prototype/wiki/Map-Examples#unique-values)
+ [Most Common Category](https://github.com/CartoDB/renderer-prototype/wiki/Map-Examples#by-most-common-category)
+ [Attribute values](https://github.com/CartoDB/renderer-prototype/wiki/Map-Examples#by-attribute-value)

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
width: 3
color: ramp($cause_descrip,Prism)
```
![screen shot 2018-02-14 at 3 39 06 pm](https://user-images.githubusercontent.com/1566273/36232131-cc1e110c-119d-11e8-81b4-8a70cd066e5a.png)

### Most common category

To color features by the most common category, you can use a [metadata operator](https://github.com/CartoDB/renderer-prototype/wiki/Operator-Tables#metadata-operators) or an [aggregation operator](LINK).

#### Metadata Operator
The map below uses the metadata operator `top` to retrieve the top 4 values in the `cause_descrip` field. Each category is colored with a unique color and all other features are colored as other.

```
width: 3
color: ramp(top($cause_descrip,4),Prism)
```
![screen shot 2018-02-15 at 2 04 07 pm](https://user-images.githubusercontent.com/1566273/36280954-32d5a660-1259-11e8-9ed7-39bd970ef7cc.png)

#### Aggregation Operator
The map below uses the aggregation operator `MODE` coloring features by the mode of the `cause_descrip` field.

```
width: 3
color: ramp(MODE($cause_descrip),Prism)
```
![screen shot 2018-02-15 at 2 09 54 pm](https://user-images.githubusercontent.com/1566273/36281190-fd346770-1259-11e8-9353-ef35fff451d3.png)

### Attribute Values

To map colors to particular categories, use the [classification operator](https://github.com/CartoDB/renderer-prototype/wiki/Operator-Tables#classification-operators) `buckets`.

The map below colors fires that were caused by `Lightning` or `Arson` and all other categories are colored as other.

```
width: 3
color: ramp(buckets($cause_descrip,"Lightning","Arson"),Prism)
```
![screen shot 2018-02-15 at 2 29 01 pm](https://user-images.githubusercontent.com/1566273/36281906-9bc451c8-125c-11e8-872c-791b7e47a514.png)

## Color and Size by Value: Numbers
There are a variety of ways to symbolize points using numeric attributes.

+ [Classed color](https://github.com/CartoDB/renderer-prototype/wiki/Map-Examples#classed-color)
+ [Classed size](https://github.com/CartoDB/renderer-prototype/wiki/Map-Examples#classed-size)
+ [Unclassed color](https://github.com/CartoDB/renderer-prototype/wiki/Map-Examples#unclassed-color)
+ [Unlcassed size](https://github.com/CartoDB/renderer-prototype/wiki/Map-Examples#unlcassed-size)
+ [Manual Classed Color](https://github.com/CartoDB/renderer-prototype/wiki/Styling-Points#manually-classed-color)
+ [Manual Classed Size](https://github.com/CartoDB/renderer-prototype/wiki/Styling-Points#manually-classed-size)


### Classed Color
Use an [available classification method](LINK), to group features into a defined set of bins and color them using a sequential color scheme.

```
width:  3
color: ramp(quantiles($total_pop,5),Emrld)
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
![screen shot 2018-02-26 at 11 06 57 am](https://user-images.githubusercontent.com/1566273/36686931-3f42422a-1ae5-11e8-896b-39dcf045e466.png)

### Manually Classed Size
TBD 