## Introduction to Sprites

CARTO VL has support for sprites, replacing the typical points by images. Those images can be builtin or external and they can also be colored and placed by CARTO VL expressions.

### Built-in sprites

We provide a set of built-in images ready to be used without additional HTTP requests. You can use the `symbol` property with the name of a built-in sprite to see it.
```js
symbol: cross
```

http://127.0.0.1:8080/examples/editor/index.html#eyJhIjoic3BlbmRfZGF0YSIsImIiOiIiLCJjIjoiY2FydG92bCIsImQiOiJodHRwczovL3t1c2VyfS5jYXJ0by5jb20iLCJlIjoid2lkdGg6IDcwXG5jb2xvcjogcmdiKDIwNCwwLDApXG5zeW1ib2w6IGNyb3NzIiwiZiI6eyJsbmciOjIuMTY3NjA2NDU4ODExMTc4NSwibGF0Ijo0MS40MDgwMTMzNzY3NDIyNX0sImciOjE3LjA0MjkyMzM2MTQxOTIxLCJoIjoiRGFya01hdHRlciJ9

### External sprites

Images can be loaded by providing URL links to them. Keep in mind that the server must respond with the appropriate CORS headers.

You can use the `sprite` expression to create a new sprite with an external image:
```js
symbol: sprite('https://libs.cartocdn.com/carto-vl/assets/marker.svg')
```

http://127.0.0.1:8080/examples/styling/sprite.html

### Matching categories with sprites

You can use multiple sprites by assigning different sprites to different points, matching by a categorical expression.

This example will match the first category (features with less than 10 million people) with the first image, and the second category (features with more than 10 million people) with the second image.

```js
symbol: ramp(buckets($pop_max, [1000000]), sprites([sprite('https://libs.cartocdn.com/carto-vl/assets/marker.svg'), sprite('https://libs.cartocdn.com/carto-vl/assets/star.svg')]))
```
http://127.0.0.1:8080/examples/styling/multiple-sprites.html


### Sprite placement

The placement or alignment of the images is controllable. By default they will be aligned to the bottom, so that the typical marker arrow points to the original feature location. However, that's not the desired behavior if the sprite is, for example, a cross. For those cases you should control it with the `symbolPlacement` property.

The `symbolPlacement` property accepts one of the built-in constants (ALIGN_BOTTOM and ALIGN_CENTER) or a placement expression (TODO link to reference).

http://127.0.0.1:8080/examples/editor/index.html#eyJhIjoic3BlbmRfZGF0YSIsImIiOiIiLCJjIjoiY2FydG92bCIsImQiOiJodHRwczovL3t1c2VyfS5jYXJ0by5jb20iLCJlIjoid2lkdGg6IDcwXG5zeW1ib2w6IGNyb3NzXG5zeW1ib2xQbGFjZW1lbnQ6IGFsaWduX2NlbnRlciIsImYiOnsibG5nIjoyLjE2NzYwNjQ1ODgxMTE3ODUsImxhdCI6NDEuNDA4MDEzMzc2NzQyMjV9LCJnIjoxNy4wNDI5MjMzNjE0MTkyMSwiaCI6IlZveWFnZXIifQ==

### Coloring sprites

The color of the images can be left as-is, overridden or modified.

The color won't be overridden, if the `color` property is not set.

#### Overriding sprite color

The color (RGB channels) of the images can be overridden by setting a `color` property. For example:

```js
symbol: cross
color: yellow
```
http://127.0.0.1:8080/examples/editor/index.html#eyJhIjoic3BlbmRfZGF0YSIsImIiOiIiLCJjIjoiY2FydG92bCIsImQiOiJodHRwczovL3t1c2VyfS5jYXJ0by5jb20iLCJlIjoid2lkdGg6IDcwXG5zeW1ib2w6IGNyb3NzXG5zeW1ib2xQbGFjZW1lbnQ6IGFsaWduX2NlbnRlclxuY29sb3I6IHdoaXRlIiwiZiI6eyJsbmciOjIuMTY3NjA2NDU4ODExMTc4NSwibGF0Ijo0MS40MDgwMTMzNzY3NDIyNX0sImciOjE3LjA0MjkyMzM2MTQxOTIxLCJoIjoiRGFya01hdHRlciJ9

#### Modifying sprite color

The color of the sprites can also be modified with other color expressions.

(Mamata, do you think we should remove this part from the guide?)
