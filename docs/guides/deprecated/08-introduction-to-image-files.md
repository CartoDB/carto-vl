## Introduction to Image Files

CARTO VL supports the use of images to render point data. Image files can be accessed directly from CARTO VL's built-in symbol library, or from external sources via an HTTP request. Any image (built-in or external) can be colored, sized and placed using CARTO VL expressions.

### Built-in images

To access image markers from the built-in symbol library, use the `symbol` property with the name of the image:

```js
symbol: cross
```

[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/image-files/built-in-image.html)

### External images

External image markers can be loaded with a URL link. To access external images, use the `symbol` property with the image URL inside of the `image` expression:

```js
symbol: image('https://libs.cartocdn.com/carto-vl/assets/NASA_logo.svg')
```

**Note:**
Keep in mind that the server must respond with the appropriate CORS headers for the image file to be properly loaded. Built-in images are not affected by CORS. See for example the following AWS S3 CORS configuration:
```json
{
    "CORSRules": [
        {
            "AllowedMethods": [
                "GET"
            ],
            "AllowedOrigins": [
                "*",
                "http://*",
                "https://*"
            ]
        }
    ]
}
```

[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/image-files/external-image.html)

### Assign images to categories

You can match specific images to specific categories in your data with a categorical expression.

The example below, assigns a unique image file to each unique `complaint` type:

```js
symbol: ramp(buckets($complaint,['Car','Bus','Building']), [car,bus,house])
```

[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/image-files/category-to-image.html)

### Color images

The color of image markers can be customized with the `color` property.

#### Global color

The example below uses the `color` property to override the image fill color from the default black, to `blue`:

```js
symbol: ramp(buckets($complaint,['Car','Bus','Building']), [car,bus,house])
color: blue
```

[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/image-files/color-image.html)

#### Color by value

The example below colors each category's image with a unique color:

```js
symbol: ramp(buckets($complaint,['Car','Bus','Building']), [car,bus,house])
color: ramp(buckets($complaint,['Car','Bus','Building']), [purple,orange,blue])
```

[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/image-files/color-category-image.html)

### Image placement

The placement and alignment of image markers is controlled using the `symbolPlacement` property. By default, image markers are bottom-aligned meaning the marker arrow points to the original feature's location.

If that is not the desired placement, you can modify with the `symbolPlacement` property which accepts one of two default constants (`align_bottom` or `align_center`) or a placement expression.

```js
symbolPlacement: align_bottom
```

The example below aligns each symbol to the center:

[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/image-files/color-category-image.html)
