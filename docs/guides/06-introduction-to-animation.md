## Introduction to Animation

Using CARTO VL you can make animated maps of points, lines, and polygons using the [`animation`](https://carto.com/developers/carto-vl/reference/#cartoexpressionsanimation) expression.

### Animation expression

The general syntax for animating data in CARTO VL is:

```
filter: animation(input, duration, fade(fadeIn, fadeOut))
```

#### Filter

The convention in CARTO VL is that `0` represents the boolean value `false`, (the absence of or an *off* state), while `1` represents `true` (the presence of or an *on* state). When the expression assigned to [`filter`](https://carto.com/developers/carto-vl/reference/#cartoexpressions) (`animation` in our case) has the value `0` for a given feature, that feature will be filtered-out and not be shown. If the value is `1`, the feature will be visible.

#### Animation expression

The `animation` expression acts like a clock, generating cyclic progress values over a determinate period to match the values of its input. When a match occurs between the input and the progress value animation returns a `1` value and otherwise it returns a `0'.

The next set of animation parameters are used to define the property, speed, and transition between animated features.

#### Input

The first animation parameter (input), is the attribute that you want to animate. By default, the cyclic animation progress varies from the attributes's minimum value
to its maximum.

You can change this range of values by using a `linear` expression, and thus visualize a subset of the data. For example, if a dataset spans an entire year, but you only want to animate between the months of February and June, you can adjust the input parameter to:

```js
  animation(linear($month, 2, 6))
```

Similarly, if you have a timestamp property (`$date`), you can select a specific range using the [`time`](https://carto.com/developers/carto-vl/reference/#cartoexpressionstime) expression:

```js
  animation(linear($date, time('2018-01-01T00:00:00'), time('2018-01-05T00:00:00'))
```

Values outside of the specified range will not appear in the animation.

#### Duration

This parameter defines the duration of the animation progress in seconds. As stated above, during the animation cycle, all possible input values are evaluated. When an input value is matched, animation returns a value of `1` for the feature and it is drawn.

#### Fade

The `fade` parameter is used to define two additional (`fadeIn, fadeOut`) durations in seconds. These parameters allow for smooth transitions between features during an animation's duration. During the *`fadeIn`* phase, all features with a match will fade-in to the animation, transitioning from `0` (invisible) to `1` (visible). During the *`fadeOut`* phase features will transition from `1` back to `0` and the next set of features will begin to fade-in.

### Example

To illustrate these concepts, we will animate the journey of three birds from January to April of 2014 using data from [movebank.org](https://www.movebank.org/).

#### Animate points

For the temporal component of the animation we will use the input `date_time` that has the date of the bird track and associated timestamp. We will set the duration to `30` and both fade parameters to `1`, so that the animation will repeat every 30 seconds and features will take 1 second to gradually become visible and another second
to disappear.

```js
filter: animation($date_time,30,fade(1,1))
```
[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/animation/step-1.html)

#### Adjust duration

In the animation above, we can see that the birds spend the majority of this three month period in West Africa and then eventually migrate to Northern Europe. To see this happen more quickly in our animation, we'll adjust the duration to `10` seconds.

```js
filter: animation($date_time,10,fade(1,1))
```
[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/animation/step-2.html)

#### Adjust fade

Since we are visualizing migration, we can adjust the `fade` parameters to give us a better sense of the journey these birds took. We will set the `fadeIn` parameter to `0` and the `fadeOut` parameter to `0.5`. What this does is keep the previous point in the animation visible for longer which helps us better visualize the path of migration.

```js
filter: animation($date_time,10,fade(1,1))
```
[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/animation/step-3.html)

#### Final touches

Since we are visualizing the journey of three different birds, we can color each one with a unique color using `buckets`, decrease the `width` of the points to `4` and finally, remove the `strokeWidth` by setting it to `0`.

```js
filter: animation($date_time,10,fade(0,0.5))
color: ramp(buckets($bird_name,["Sanne","Eric","Nico"]),[deeppink,yellow,turquoise,gray])
width: 4
strokeWidth: 0
```
[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/animation/step-4.html)

