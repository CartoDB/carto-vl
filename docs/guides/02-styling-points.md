## About this Guide

This guide walks through making a variety of common thematic map types for points.

## Basic Styling Properties

+ Point Size
+ Point Color
+ Point Stroke Widthe-width
+ Point Stroke Colore-color
+ Cluster Resolutionolution
+ Point Draw Orderorder

### Point Size

To adjust the point size, use the `width` property.

```
width: 5
```

[Example](https://cartodb.github.io/renderer-prototype/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1IiwiZiI6eyJsbmciOi04Ni45ODUxNDA3MDY2NjM3NCwibGF0IjotMS4xMzY4NjgzNzcyMTYxNjAzZS0xM30sImciOjAuMzUzMTQ2NzEyMTMwODk3MX0=)

### Point Color
Use the `color` property to color features with one of CARTO VL's [supported color spaces](LINK).

```
width: 5
color: hsv(0.6,1,1)
```
[Example](https://cartodb.github.io/renderer-prototype/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5jb2xvcjogaHN2KDAuNiwxLDEpIiwiZiI6eyJsbmciOi05My40ODYxMjU0MzYyNzk3OSwibGF0IjozNi42OTk4MTAyNTcwODQxOH0sImciOjIuNTg3ODYwNDM1NjA4ODE5M30=)

### Point Stroke Width

```
width: 5
color: hsv(0.6,1,1)
strokeWidth: 1
```
[Example](https://cartodb.github.io/renderer-prototype/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5jb2xvcjogaHN2KDAuNiwxLDEpXG5zdHJva2VXaWR0aDogMSIsImYiOnsibG5nIjotOTMuNDg2MTI1NDM2Mjc5NzksImxhdCI6MzYuNjk5ODEwMjU3MDg0MTh9LCJnIjoyLjU4Nzg2MDQzNTYwODgxOTN9)

### Point Stroke Color

```
width: 5
color: hsv(0.6,1,1)
strokeWidth: 1
strokeColor: hsv(1,0,1)
```
[Example](https://cartodb.github.io/renderer-prototype/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5jb2xvcjogaHN2KDAuNiwxLDEpXG5zdHJva2VXaWR0aDogMVxuc3Ryb2tlQ29sb3I6IGhzdigxLDAsMSkiLCJmIjp7ImxuZyI6LTk1LjMxMzkxNjE5MTI2NzgyLCJsYXQiOjM3LjQ5NDk5NjQ4Mjc0NTc1fSwiZyI6Mi45Nzc3MTkwMjk3ODU2NzN9)

### Cluster Resolution
Points are clustered within the defined resolution and the placement of the point is based on the properties of all points in the defined cluster resolution.

```
width: 5
resolution: 5
```
[Example](https://cartodb.github.io/renderer-prototype/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5yZXNvbHV0aW9uOiA1IiwiZiI6eyJsbmciOi05NS4zMTM5MTYxOTEyNjc4MiwibGF0IjozNy40OTQ5OTY0ODI3NDU3NX0sImciOjIuOTc3NzE5MDI5Nzg1NjczfQ==)

### Point Draw Order

```
order: desc(width())
```

## Color by Value: String
+ Unique Values
+ Most Common
+ Attribute

### Unique Values  
The map below assigns a unique color to each category value in the `cause_descrip` field using a qualitative CARTOColor scheme `Prism`. By default, features with different `cause_descrip` are not aggregated together.

```
width: 5
color: ramp($commodity_name,Prism)
```
[Example](https://cartodb.github.io/renderer-prototype/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5jb2xvcjogcmFtcCgkY29tbW9kaXR5X25hbWUsUHJpc20pIiwiZiI6eyJsbmciOi05Ni42NTI3OTQzMzU0NTkyNSwibGF0Ijo0OC4wMDcyNDM5MjcyNjEzNn0sImciOjIuOTc3NzE5MDI5Nzg1NjczfQ==)

### Most common category

To color features by the most common category, you can use a metadata operatoror an aggregation operator.

#### Metadata Operator
The map below uses the metadata operator `top` to retrieve the top 4 values in the `commodity_name` field. Each category is colored with a unique color and all other features are colored as other.

```
width: 5
color: ramp(top($commodity_name,5),Prism)
```
[Example](https://cartodb.github.io/renderer-prototype/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5jb2xvcjogcmFtcCh0b3AoJGNvbW1vZGl0eV9uYW1lLDUpLFByaXNtKVxuIiwiZiI6eyJsbmciOi05Ni4xMTY5MjM2NzkzNDc3OSwibGF0Ijo0Ny41NTIxNjA5MDU5OTIxMX0sImciOjMuMDY4NDU0MTIwMzM3NjI4OH0=)

#### Aggregation Operator
The map below uses the aggregation operator `MODE` coloring features by the mode of the `commodity_name` field.

```
width: 5
color: ramp(MODE($commodity_name),Prism)
```
[Example](https://cartodb.github.io/renderer-prototype/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5jb2xvcjogcmFtcChNT0RFKCRjb21tb2RpdHlfbmFtZSksUHJpc20pXG4iLCJmIjp7ImxuZyI6LTk2LjExNjkyMzY3OTM0Nzc5LCJsYXQiOjQ3LjU1MjE2MDkwNTk5MjExfSwiZyI6My4wNjg0NTQxMjAzMzc2Mjg4fQ==)

### Attribute Values

To map colors to particular categories, use the classification operator `buckets`.

The map below colors fires that were caused by `Lightning` or `Arson` and all other categories are colored as other.

```
width: 5
color: ramp(buckets($commodity_name,"SOYBEANS","RICE","WHEAT"),Prism)
```
[Example](https://cartodb.github.io/renderer-prototype/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5jb2xvcjogcmFtcChidWNrZXRzKCRjb21tb2RpdHlfbmFtZSxcIlNPWUJFQU5TXCIsXCJSSUNFXCIsXCJXSEVBVFwiKSxQcmlzbSlcbiIsImYiOnsibG5nIjotOTYuMTE2OTIzNjc5MzQ3NzksImxhdCI6NDcuNTUyMTYwOTA1OTkyMTF9LCJnIjozLjA2ODQ1NDEyMDMzNzYyODh9)

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
