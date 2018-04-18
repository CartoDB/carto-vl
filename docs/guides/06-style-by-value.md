# Styling by Value

## Overview of Ramp

The `ramp` expression can be used in many forms. Summarizing, `ramp` maps some kind of input (both categorical and numerical data) to some kind of output (both colors and numbers). This can be used to create choropleth maps and bubble maps with ease.

## Styling by a categorical expression

### Specifying a color <=> category relation

To map colors to particular categories, use the classification operator `buckets`.

The map below will assign colors from the `Prism` palette to the categories 'SOYBEANS', 'RICE', 'WHEAT', the rest of the categories will receive the last color `others`.

```
width: 5
color: ramp(buckets($commodity_name,'SOYBEANS', 'RICE', 'WHEAT'), Prism)
```
[Example](https://cartodb.github.io/carto-vl/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5jb2xvcjogcmFtcChidWNrZXRzKCRjb21tb2RpdHlfbmFtZSwnU09ZQkVBTlMnLCAnUklDRScsICdXSEVBVCcpLCBQcmlzbSkiLCJmIjp7ImxuZyI6LTk2LjExNjkyMzY3OTM0Nzc5LCJsYXQiOjQ3LjU1MjE2MDkwNTk5MjExfSwiZyI6My4wNjg0NTQxMjAzMzc2Mjg4fQ==)

### Showing the Most Common Categories
The map below uses the expression `top` to retrieve the top 4 values in the `commodity_name` field. Each of those categories category will be colored with a unique color and all other features will be colored as `others`.

```
width: 5
color: ramp(top($commodity_name,5), Prism)
```
[Example](https://cartodb.github.io/carto-vl/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5jb2xvcjogcmFtcCh0b3AoJGNvbW1vZGl0eV9uYW1lLDUpLFByaXNtKVxuIiwiZiI6eyJsbmciOi05Ni4xMTY5MjM2NzkzNDc3OSwibGF0Ijo0Ny41NTIxNjA5MDU5OTIxMX0sImciOjMuMDY4NDU0MTIwMzM3NjI4OH0=)

### Showing all categories automatically
The map below assigns a unique color to each category value in the `cause_descrip` field using a qualitative CARTOColor scheme `Prism`. When the number of categories is bigger than the number of colors in the palette color interpolation will be used.

```
width: 5
color: ramp($commodity_name, Prism)
```
[Example](https://cartodb.github.io/carto-vl/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5jb2xvcjogcmFtcCgkY29tbW9kaXR5X25hbWUsIFByaXNtKSIsImYiOnsibG5nIjotOTYuNjUyNzk0MzM1NDU5MjUsImxhdCI6NDguMDA3MjQzOTI3MjYxMzZ9LCJnIjoyLjk3NzcxOTAyOTc4NTY3M30=)

### Classifying a numeric expression

## Styling by a numeric expression

### Unclassed maps
You can make an unclassed map by using `linear`.

In this example, the color will be set for each feature based on the `total_pop` property, where features with a `total_pop` of 1000 or less will be colored with the first color from the palette, features with a `total_pop` of 500000 or more will be colored with the last color from the palette and features in between will receive an interpolated color.
```
color: ramp(linear($total_pop,1000,500000),ag_sunset)
```
![screen shot 2018-02-15 at 3 34 18 pm](https://user-images.githubusercontent.com/1566273/36285405-a5c20e98-1268-11e8-9c7a-5598ad0438cd.png)

### Classed maps
Use an [available classification method](LINK), to group features into a set of bins and color them using a sequential color scheme.

#### Quantiles
This example will classify the `total_pop` property using the `quantiles` method with `5` buckets.
```
color: ramp(quantiles($total_pop, 5), Emrld)
```
![screen shot 2018-02-15 at 2 59 39 pm](https://user-images.githubusercontent.com/1566273/36283177-e2bb2aee-1260-11e8-9a48-147b2a193a0a.png)

#### Manual classification

This example will classify the `total_pop` property using two custom breakpoints (`10` and `250`), which will generate 3 classes.
```
color: ramp(buckets($price, 10, 250), Emrld)
```


### Alpha by value

## Making a bubble map

## Using custom color palettes




#### Aggregation Operator
The map below uses the aggregation operator `MODE` coloring features by the mode of the `commodity_name` field.

```
width: 5
color: ramp(MODE($commodity_name),Prism)
```
[Example](https://cartodb.github.io/carto-vl/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5jb2xvcjogcmFtcChNT0RFKCRjb21tb2RpdHlfbmFtZSksUHJpc20pXG4iLCJmIjp7ImxuZyI6LTk2LjExNjkyMzY3OTM0Nzc5LCJsYXQiOjQ3LjU1MjE2MDkwNTk5MjExfSwiZyI6My4wNjg0NTQxMjAzMzc2Mjg4fQ==)

### Attribute Values


## Color and Size by Value: Numbers
There are a variety of ways to symbolize points using numeric attributes.

+ Classed color
+ Classed size
+ Unclassed color
+ Unlcassed size
+ Manual Classed Color
+ Manual Classed Size




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
