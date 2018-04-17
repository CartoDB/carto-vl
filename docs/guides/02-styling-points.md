## About this Guide

This guide walks through making a variety of common thematic map types for points.

## Basic Styling Properties

+ Width
+ Color
+ Stroke width
+ Stroke color
+ Cluster resolution
+ Order

### Width

Use the `width` property to adjust the point `diameter` in pixels.

Remember there is a limitation in the total diameter (fill + stroke)  of **124px**. So a point with a total with of 300px will fit 126px at most.

```
width: 5
```

[Example](https://cartodb.github.io/carto-vl/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1IiwiZiI6eyJsbmciOi04Ni45ODUxNDA3MDY2NjM3NCwibGF0IjotMS4xMzY4NjgzNzcyMTYxNjAzZS0xM30sImciOjAuMzUzMTQ2NzEyMTMwODk3MX0=)

### Color
Use the `color` property to color features with one of CARTO VL's [supported color expressions](LINK).

```
width: 5
color: hsv(0.6,1,1)
```
[Example](https://cartodb.github.io/carto-vl/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5jb2xvcjogaHN2KDAuNiwxLDEpIiwiZiI6eyJsbmciOi05My40ODYxMjU0MzYyNzk3OSwibGF0IjozNi42OTk4MTAyNTcwODQxOH0sImciOjIuNTg3ODYwNDM1NjA4ODE5M30=)

### Stroke Width
The `strokeWidth` property indicates the size in pixels of the point stroke.
The stroke grows from the point diameter in both directions, half to the inside and half to the outside.

Remember there is a limitation in the total diameter (fill + stroke)  of **124px**. So a point with a total with of 300px will fit 126px at most.

```
width: 5
color: hsv(0.6,1,1)
strokeWidth: 1
```
[Example](https://cartodb.github.io/carto-vl/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5jb2xvcjogaHN2KDAuNiwxLDEpXG5zdHJva2VXaWR0aDogMSIsImYiOnsibG5nIjotOTMuNDg2MTI1NDM2Mjc5NzksImxhdCI6MzYuNjk5ODEwMjU3MDg0MTh9LCJnIjoyLjU4Nzg2MDQzNTYwODgxOTN9)

### Stroke Color

The `strokeColor` property indicates the color of the point's stroke using a [supported color expression](TODO).

```
width: 5
color: hsv(0.6,1,1)
strokeWidth: 1
strokeColor: hsv(1,0,1)
```
[Example](https://cartodb.github.io/carto-vl/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5jb2xvcjogaHN2KDAuNiwxLDEpXG5zdHJva2VXaWR0aDogMVxuc3Ryb2tlQ29sb3I6IGhzdigxLDAsMSkiLCJmIjp7ImxuZyI6LTk1LjMxMzkxNjE5MTI2NzgyLCJsYXQiOjM3LjQ5NDk5NjQ4Mjc0NTc1fSwiZyI6Mi45Nzc3MTkwMjk3ODU2NzN9)

### Resolution
Use the `resolution` property to take advantage of the potential of [CARTO aggregations](TODO).

Aggregations will cluster the number of visible points depending on the zoom level increasing the performance and map visibility.



```
width: 5
resolution: 5
```
[Example](https://cartodb.github.io/carto-vl/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5yZXNvbHV0aW9uOiA1IiwiZiI6eyJsbmciOi05NS4zMTM5MTYxOTEyNjc4MiwibGF0IjozNy40OTQ5OTY0ODI3NDU3NX0sImciOjIuOTc3NzE5MDI5Nzg1NjczfQ==)

### Order
Use the `order` property to control the order in which the points are rendered. 


```
order: desc(width())
```

Possible values are:

- `noOrder()` : The points are renderer as they come from the data source.
- `desc(width())`: The points are renderer in descendant order according to its width: bigger points on top.
- `asc(width())` : The points are renderer in ascendant order according to its width: smaller points on top.



#### Limitations
- This property doesn't guarantee a complete ordering.
- Usage of zoom in the `width` property can produce popping once combined with `order`.
