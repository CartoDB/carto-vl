# Styling by Value

## Styling by a categorical property

### Specifying a color <=> category relation

### Showing the Most common categories

### Showing all categories automatically

## Styling by a numeric property

### Unclassed maps

### Classed maps

### Alpha by value



## Color by Value: Categorical properties
+ Unique Values
+ Most Common
+ Attribute

### Unique Values
The map below assigns a unique color to each category value in the `cause_descrip` field using a qualitative CARTOColor scheme `Prism`. By default, features with different `cause_descrip` are not aggregated together.

```
width: 5
color: ramp($commodity_name,Prism)
```
[Example](https://cartodb.github.io/carto-vl/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5jb2xvcjogcmFtcCgkY29tbW9kaXR5X25hbWUsUHJpc20pIiwiZiI6eyJsbmciOi05Ni42NTI3OTQzMzU0NTkyNSwibGF0Ijo0OC4wMDcyNDM5MjcyNjEzNn0sImciOjIuOTc3NzE5MDI5Nzg1NjczfQ==)

### Most common category

To color features by the most common category, you can use a metadata operatoror an aggregation operator.

#### Metadata Operator
The map below uses the metadata operator `top` to retrieve the top 4 values in the `commodity_name` field. Each category is colored with a unique color and all other features are colored as other.

```
width: 5
color: ramp(top($commodity_name,5),Prism)
```
[Example](https://cartodb.github.io/carto-vl/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5jb2xvcjogcmFtcCh0b3AoJGNvbW1vZGl0eV9uYW1lLDUpLFByaXNtKVxuIiwiZiI6eyJsbmciOi05Ni4xMTY5MjM2NzkzNDc3OSwibGF0Ijo0Ny41NTIxNjA5MDU5OTIxMX0sImciOjMuMDY4NDU0MTIwMzM3NjI4OH0=)

#### Aggregation Operator
The map below uses the aggregation operator `MODE` coloring features by the mode of the `commodity_name` field.

```
width: 5
color: ramp(MODE($commodity_name),Prism)
```
[Example](https://cartodb.github.io/carto-vl/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5jb2xvcjogcmFtcChNT0RFKCRjb21tb2RpdHlfbmFtZSksUHJpc20pXG4iLCJmIjp7ImxuZyI6LTk2LjExNjkyMzY3OTM0Nzc5LCJsYXQiOjQ3LjU1MjE2MDkwNTk5MjExfSwiZyI6My4wNjg0NTQxMjAzMzc2Mjg4fQ==)

### Attribute Values

To map colors to particular categories, use the classification operator `buckets`.

The map below colors fires that were caused by `Lightning` or `Arson` and all other categories are colored as other.

```
width: 5
color: ramp(buckets($commodity_name,"SOYBEANS","RICE","WHEAT"),Prism)
```
[Example](https://cartodb.github.io/carto-vl/example/mapbox.html#eyJhIjoiY3JvcF9sb3NzXzIwMTciLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiA1XG5jb2xvcjogcmFtcChidWNrZXRzKCRjb21tb2RpdHlfbmFtZSxcIlNPWUJFQU5TXCIsXCJSSUNFXCIsXCJXSEVBVFwiKSxQcmlzbSlcbiIsImYiOnsibG5nIjotOTYuMTE2OTIzNjc5MzQ3NzksImxhdCI6NDcuNTUyMTYwOTA1OTkyMTF9LCJnIjozLjA2ODQ1NDEyMDMzNzYyODh9)

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
