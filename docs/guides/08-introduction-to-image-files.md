## Introduction to Image Markers

CARTO VL supports the use of images to render point data. Image markers can be accessed directly from CARTO VL's built-in symbol library, or from external sources via an HTTP request. Any image (built-in or external) can be colored, sized and placed using CARTO VL expressions.

### Built-in images

To access image markers from the built-in symbol library, use the `symbol` property with the name of the image:

```js
symbol: cross
```

http://127.0.0.1:8080/examples/editor/index.html#eyJhIjoidGFibGVfMzExX2NvbXBsYWludHMiLCJiIjoiIiwiYyI6ImNhcnRvdmwiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6InN5bWJvbDogY3Jvc3NcbndpZHRoOiAyMCIsImYiOnsibG5nIjotNzMuOTU4MDkyMjE5NjM1NjYsImxhdCI6NDAuNzA3ODUyMzU5MTg3MjN9LCJnIjoxNS40ODAwMzA5NDk0MjMzNDgsImgiOiJWb3lhZ2VyIn0=

### External images

External image markers can be loaded with a URL link. 

Note: Keep in mind that the server must respond with the appropriate CORS headers for the image file to be properly loaded.

To access external images, use the `symbol` property with the image URL inside of the `sprite` expression:

```js
symbol: image('https://libs.cartocdn.com/carto-vl/assets/marker.svg')
```

http://127.0.0.1:8080/examples/styling/sprite.html

### Assign images to categories

You can match specific images to specific categories in your data with a categorical expression.

The example below, assigns a unique image file to each unique complaint type:

```js
symbol: ramp(buckets($complaint,['Car','Bus','Building']),images([car,bus,house]))
```

http://127.0.0.1:8080/examples/editor/index.html#eyJhIjoidGFibGVfMzExX2NvbXBsYWludHMiLCJiIjoiIiwiYyI6ImNhcnRvdmwiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6InN5bWJvbDogcmFtcChidWNrZXRzKCRjb21wbGFpbnQsWydDYXInLCdCdXMnLCdCdWlsZGluZyddKSxzcHJpdGVzKFtjYXIsYnVzLGhvdXNlXSkpXG53aWR0aDogMjVcbiIsImYiOnsibG5nIjotNzMuOTU2MDgzMDI4OTI2NzQsImxhdCI6NDAuNzEyMDcyOTA1NDQ2NzQ2fSwiZyI6MTYuMTA3NjAwNTA0ODc0MjY3LCJoIjoiVm95YWdlciJ9

### Color images

The color of image markers can be customized with the `color` property.

#### Global color

The example below uses the `color` property to override the image fill color from the default black, to `blue`:

```js
symbol: ramp(buckets($complaint,['Car','Bus','Building']),images([car,bus,house]))
color: blue
```
http://127.0.0.1:8080/examples/editor/index.html#eyJhIjoic3BlbmRfZGF0YSIsImIiOiIiLCJjIjoiY2FydG92bCIsImQiOiJodHRwczovL3t1c2VyfS5jYXJ0by5jb20iLCJlIjoid2lkdGg6IDcwXG5zeW1ib2w6IGNyb3NzXG5zeW1ib2xQbGFjZW1lbnQ6IGFsaWduX2NlbnRlclxuY29sb3I6IHdoaXRlIiwiZiI6eyJsbmciOjIuMTY3NjA2NDU4ODExMTc4NSwibGF0Ijo0MS40MDgwMTMzNzY3NDIyNX0sImciOjE3LjA0MjkyMzM2MTQxOTIxLCJoIjoiRGFya01hdHRlciJ9

#### Color by value

The example below colors each category's image with a unique color:

```js
symbol: ramp(buckets($complaint,['Car','Bus','Building']),images([car,bus,house]))
color: ramp(buckets($complaint,['Car','Bus','Building']),[purple,orange,blue])
```

http://127.0.0.1:8080/examples/editor/index.html#eyJhIjoidGFibGVfMzExX2NvbXBsYWludHMiLCJiIjoiIiwiYyI6ImNhcnRvdmwiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6InN5bWJvbDogcmFtcChidWNrZXRzKCRjb21wbGFpbnQsWydDYXInLCdCdXMnLCdCdWlsZGluZyddKSxzcHJpdGVzKFtjYXIsYnVzLGhvdXNlXSkpXG5jb2xvcjogcmFtcChidWNrZXRzKCRjb21wbGFpbnQsWydDYXInLCdCdXMnLCdCdWlsZGluZyddKSxbcHVycGxlLG9yYW5nZSxibHVlXSlcbndpZHRoOiAyNVxuIiwiZiI6eyJsbmciOi03My45NTYwODMwMjg5MjY3NCwibGF0Ijo0MC43MTIwNzI5MDU0NDY3NDZ9LCJnIjoxNi4xMDc2MDA1MDQ4NzQyNjcsImgiOiJWb3lhZ2VyIn0=

### Image placement

The placement and alignment of image markers is controlled using the `symbolPlacement` property. By default, image markers are bottom-aligned meaning the marker arrow points to the original feature's location. If that is not the desired behavior, you can modify the placement with the `symbolPlacement` property.

The `symbolPlacement` property accepts one of two default constants (`align_bottom` or `align_center`) or a placement expression (TODO link to reference).

The example below aligns each symbol to the center: 

http://127.0.0.1:8080/examples/editor/index.html#eyJhIjoidGFibGVfMzExX2NvbXBsYWludHMiLCJiIjoiIiwiYyI6ImNhcnRvdmwiLCJkIjoiaHR0cHM6Ly97dXNlcn0uY2FydG8uY29tIiwiZSI6InN5bWJvbDogcmFtcChidWNrZXRzKCRjb21wbGFpbnQsWydDYXInLCdCdXMnLCdCdWlsZGluZyddKSxzcHJpdGVzKFtjYXIsYnVzLGhvdXNlXSkpXG5jb2xvcjogcmFtcChidWNrZXRzKCRjb21wbGFpbnQsWydDYXInLCdCdXMnLCdCdWlsZGluZyddKSxbcHVycGxlLG9yYW5nZSxibHVlXSlcbnN5bWJvbFBsYWNlbWVudDogYWxpZ25fYm90dG9tXG53aWR0aDogMjUiLCJmIjp7ImxuZyI6LTczLjk1NTIwOTcyMzUxNDU0LCJsYXQiOjQwLjcxMjMxMzc4NjEwMTQyfSwiZyI6MTYuMDAxNzUwOTM0OTk2MjUyLCJoIjoiVm95YWdlciJ9

