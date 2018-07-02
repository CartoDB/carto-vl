# CARTO VL

[![CircleCI](https://circleci.com/gh/CartoDB/carto-vl.svg?style=svg)](https://circleci.com/gh/CartoDB/carto-vl)

CARTO VL is a JavaScript library for developers to create vector-based visualizations inside Location Intelligence applications.
The library is currently in its Beta version and we welcome [your feedback](#Feedback) and requests to make it even better!

![](https://carto.com/blog/img/posts/2018/2018-05-21-carto-vl-vector-library/interpolated-lines.82265604.gif)
![](https://carto.com/blog/img/posts/2018/2018-05-21-carto-vl-vector-library/interactivity.44cada98.gif)
![](https://carto.com/blog/img/posts/2018/2018-05-21-carto-vl-vector-library/polygon-animation.bf485125.gif)
![](https://carto.com/blog/img/posts/2018/2018-05-21-carto-vl-vector-library/line-animation.c9c09239.gif)

## Features

- Maps are rendered client-side, instead of being rendered on the server. As a result, we provide faster load times and overall app performance by eliminating potential server problems.
- Built-in smart point aggregations and geometry simplifications making it easier than ever to visualize and interact with larger datasets. CARTO VL does this in a dynamic and automatic way, meaning you don’t need to rerun costly and time-expensive pre-processing steps over the geometry.
- Ability to modify geometries directly in the browser. This is a powerful solution for animated visualizations of points, lines, and polygons.
- With CARTO VL, developers have full control over everything happening on the map and can provide rich reactions to user interactions.
- New and intuitive map styling language that is designed specifically for multi-scale, thematic cartography. With just a few lines, complex visualizations can be created. Non-programmers can create their first map easily, while programmers will still be able to exploit the full potential of the CARTO ecosystem.

## Example

Run this

```
width: zoom()
color: ramp(buckets($dn, [80, 100, 140]), prism)
strokeWidth: 0
filter: $dn > 60
```

To see

![IMAGE](https://github.com/CartoDB/carto-vl/blob/master/docs/images/map-example.png)

## I want to make a map

Vamos!

To start, you will need a basic HTML file structure to display your map in a browser. We recommend you to follow this [Getting started](https://carto.com/developers/carto-vl/guides/getting-started/) guide to create a basic map.

Then, start by getting familiarized with [CARTO VL's Syntax](https://carto.com/developers/carto-vl/guides/the-basics-of-syntax/) and follow up with all our available introduction guides:

- [Expressions](https://carto.com/developers/carto-vl/guides/introduction-to-expressions/)
- [Interpolation](https://carto.com/developers/carto-vl/guides/introduction-to-interpolation/)
- [Styling](https://carto.com/developers/carto-vl/guides/introduction-to-styling/)
- [Animation](https://carto.com/developers/carto-vl/guides/introduction-to-animation/)
- [Interactivity](https://carto.com/developers/carto-vl/guides/introduction-to-interactivity/)

Also, take a look at our [examples](https://carto.com/developers/carto-vl/examples/) to understand the possibilities and inspire you!

Happy mapping!

## I want to contribute to CARTO VL

Great! Let's get you set up!

### Install

First, clone the `carto-vl` repository.

```
```

Then, install the dependencies. Note that `node >=6.11.5` is required.

```
yarn
```

/// Add segment about tests

### Start developing

Get started using CARTO VL's documentation at [CARTO's Developer Center](https://carto.com/developers/carto-vl/).

 - [Guides](https://carto.com/developers/carto-vl/guides/): get to know the library!
 - [Full reference API](https://carto.com/developers/carto-vl/reference/): for specific methods, arguments, and sample code.

### Play with the examples

You can find all the [examples](https://carto.com/developers/carto-vl/examples/) on the documentation in the `examples` folder. There are also some developer focused examples on the `debug` folder.

First, create a bundle by running the following command

```
yarn build:watch
```

And access them with

```
yarn serve
```

For more information, please read [DEVELOPERS.md](https://github.com/CartoDB/carto-vl/blob/master/DEVELOPERS.md).

### Contributing

Lastly, check out [CONTRIBUTING.md](https://github.com/CartoDB/carto-vl/blob/master/CONTRIBUTING.md) for more information about submitting pull requests to us. You will need to sign a Contributor License Agreement (CLA) before making a submission. [Learn more here.](https://carto.com/contributions/)

## <a name="feedback">Feedback</a>

CARTO VL is still in Beta but we encourage you to start playing with it and to please [send us feedback](URL) so we can create an even better library, suited to your needs.

## Built with

- [WebGL](https://www.khronos.org/webgl/)

### Works with

- [Mapbox GL](https://github.com/mapbox/mapbox-gl-js)

### Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/CartoDB/carto-vl/tags).

### Authors

- [David Manzanares](https://github.com/davidmanzanares)
- [Jesús Arroyo Torrens](https://github.com/Jesus89)
- [Iago Lastra](https://github.com/IagoLast)
- [Javier Goizueta](https://github.com/jgoizueta)
- [Elena Torro](https://github.com/elenatorro)
- [Raúl Ochoa](https://github.com/rochoa)
- [Mamata Akella](https://github.com/makella)
- [Ariana Escobar](https://github.com/arianaescobar)

### License

This project is licensed under the BSD 3-clause "New" or "Revised" License - see the [LICENSE.txt](LICENSE.txt) file for details.
