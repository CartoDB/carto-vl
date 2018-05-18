# Interpolation

Interpolation is the process of mixing two values producing one that is a combination of them. This combination can be controlled by weighting each original value differently. 

For example, in real life we usually mix cold and hot water to get warm water, and in many cases we don’t want an equal share of cold and hot water: we may choose to have 70% hot water and 30% cold water. This distributing factor is the third and last input of an interpolation.

## Types of Interpolation and Use cases

Interpolation can be used with two basic purposes
### Mapping an input variable to different colors or point sizes
We can use interpolation to create maps and visualizations without any kind of quantification or classification process.

Visualizations can be created by classifying an input variable in a set of fixed buckets, that is useful to create meaningful maps, to draw the attention to some insights and to reduce noise which will help us since our perception capabilities are limited. However, classifying a continuous variable is a one-way process that loses information.

Looking at the raw data by interpolating colors or sizes in a bubble map based on the continuous variable before applying a classification method is a good exploratory analysis. Comparing classifications forms with the interpolated form is also a good way to validate that the classification method and parameters  (explanatory analysis) are improving the visualization without distorting it.





#### Example

Let’s start creating a bubble map with area proportional to one of the properties of the dataset (price). We’ll use the sqrt function to make the area proportional instead of making the width proportional, in general you should always use sqrt for this case.
```
width: sqrt($amount)
```
https://cartodb.github.io/carto-vl/examples/editor/index.html#eyJhIjoidHhfMDEyNV9jb3B5X2NvcHkiLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiBzcXJ0KCRhbW91bnQpXG4iLCJmIjp7ImxuZyI6Mi4yMDIxMDMxODU1NDEyMDQ4LCJsYXQiOjQxLjM5ODIwMTQ3NTg5MzN9LCJnIjoxNS40MTg2NzI1MDY4MzQ3MjMsImgiOiJEYXJrTWF0dGVyIn0=

Be careful though, since many times we need to multiply by a constant to avoid having too big or too small points. For example, you could use width: `0.5*sqrt($amount)`


We can also color by value instead of having a fixed default color. The ramp expression will map an input, in this case the amount on the range [10, 1000] € to an output, in this case the cartocolor palette *emrld*.

```
width: sqrt($amount)
color: ramp(linear($amount, 10, 1000), emrld)
strokeWidth: 0
```

https://cartodb.github.io/carto-vl/examples/editor/index.html#eyJhIjoidHhfMDEyNV9jb3B5X2NvcHkiLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiBzcXJ0KCRhbW91bnQpXG5jb2xvcjogcmFtcChsaW5lYXIoJGFtb3VudCwgMTAsIDEwMDApLCBlbXJsZClcbnN0cm9rZVdpZHRoOiAwXG4iLCJmIjp7ImxuZyI6Mi4yMDIxMDMxODU1NDEyMDQ4LCJsYXQiOjQxLjM5ODIwMTQ3NTg5MzN9LCJnIjoxNS40MTg2NzI1MDY4MzQ3MjMsImgiOiJEYXJrTWF0dGVyIn0=
### Mixing expressions for smooth transitions: multi-scale maps
Being able to mix expressions without popping is a very useful tool that can be used in different situations, we’ll look here at one particular example: creating maps with different styles at different zoom levels.

With CartoCSS powered renderers it’s easy to write conditional styling that styles a map in one way at some zoom levels, and styles it in other way at other zoom levels. However, it is not possible to have a smooth transition between those styles. The sudden change of style is what we call popping.

The CARTO VL interpolation capabilities enables the combination of multiple styles for different zoom level with smooth transitions: without popping.


#### Example

Following the previous example, we may want to fix the width on 1 pixel on low zoom levels, yet keep the bubble-map on high zoom levels:

```
width: blend(1, sqrt($amount), linear(zoom(), 2^10, 2^14))
color: ramp(linear($amount, 10, 1000), emrld)
strokeWidth: 0
```

Here, we are telling CARTO VL to use 1 on zoom levels that are smaller than 10, use the original bubblemap expression on zoom levels higher than 14, and mix both (1 and the bubblemap expression) in the intermediate zoom levels.

https://cartodb.github.io/carto-vl/examples/editor/index.html#eyJhIjoidHhfMDEyNV9jb3B5X2NvcHkiLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiBibGVuZCgxLCBzcXJ0KCRhbW91bnQpLCBsaW5lYXIoem9vbSgpLCAyXjEwLCAyXjE0KSlcbmNvbG9yOiByYW1wKGxpbmVhcigkYW1vdW50LCAxMCwgMTAwMCksIGVtcmxkKVxuc3Ryb2tlV2lkdGg6IDBcbiIsImYiOnsibG5nIjoyLjIwMjEwMzE4NTU0MTIwNDgsImxhdCI6NDEuMzk4MjAxNDc1ODkzM30sImciOjE1LjQxODY3MjUwNjgzNDcyMywiaCI6IkRhcmtNYXR0ZXIifQ==


