# Interpolation

Interpolation is the process of estimating an unknown value from two known values. This estimation can be controlled by weighting each original value differently. 

For example, in real life we usually mix cold and hot water to get warm water, and in many cases we don’t want an equal share of cold and hot water: we may choose to have 70% hot water and 30% cold water. This distributing factor is the third and last input of an interpolation.

## Types of Interpolation and Use cases

In data visualization, interpolation is traditionally used for two basic purposes: interpolating between symbol sizes and interpolating between colors. 

### Interpolating colors and sizes based on a range of values
Interpolation is useful for exploratory analysis of continuous data. It has the potential to uncover insights that may otherwise be hidden using classification methods, like quantiles or equal intervals, that group values into a predefined number of buckets. Using interpolation, the entire range of values are mapped to a color, size, or other visual variable providing a "raw" visualization of the data that minimizes the effects of generalization.

#### Example

We will start by creating a map where each point's area is proportionate to its attribute value (amount) using the square root (`sqrt`) function. 

```
width: sqrt($amount)
```
https://cartodb.github.io/carto-vl/examples/editor/index.html#eyJhIjoidHhfMDEyNV9jb3B5X2NvcHkiLCJiIjoiIiwiYyI6ImNhcnRvZ2wiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6IndpZHRoOiBzcXJ0KCRhbW91bnQpXG4iLCJmIjp7ImxuZyI6Mi4yMDIxMDMxODU1NDEyMDQ4LCJsYXQiOjQxLjM5ODIwMTQ3NTg5MzN9LCJnIjoxNS40MTg2NzI1MDY4MzQ3MjMsImgiOiJEYXJrTWF0dGVyIn0=

In order to avoid symbols that are visually too large or too small, there are times when multiplying by a constant is recommended. For example, the styling above could be modified to `width: 0.5*sqrt($amount)` essentially cutting the symbol size in half.

In addition to sizing each symbol proportionate to `amount`, we can also assign a color to each symbol based on a range of values. Below, the `ramp` expression takes an input, in this case the `amount` from the range `[10, 1000]` € and maps it to an output, in this case the CARTOColor scheme *emrld*.

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


