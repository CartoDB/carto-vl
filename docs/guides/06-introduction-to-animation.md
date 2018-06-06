## Introduction to Animation

Using CARTO VL you can make animated maps of points, lines, and polygons using the [`torque`](https://carto.com/developers/carto-vl/reference/#cartoexpressionstorque) expression. 

**Note:**
While the expression name torque is inspired by another [CARTO technology](https://carto.com/torque/) for temporal mapping, the two are not equal. When creating temporal maps with CARTO VL, always refer to this documentation.

### Torque parameters

The general syntax for animating data in CARTO VL is:

```
filter: torque(input, duration, fade(fadeIn, fadeOut))
```

#### Filter
The convention in CARTO VL is that `0` represents the boolean value `false`, (the absence of or an *off* state), while `1` represents `true` (the presence of or an *on* state). The `torque` expression generates a cyclic value ranging from `0` to `1` within a specified animation duration. If a feature exists, it will be given a value of `1`, if not, `0`. By applying this generated value to a [`filter`](https://carto.com/developers/carto-vl/reference/#cartoexpressions), features appear only when there is a match. 

The next set of torque parameters are used to define the property, speed, and transition between animated features.

#### Input

The first torque parameter (input), is the attribute that you want to animate. By default, torque maps the attribute's minimum and maximum values to `0` and `1` respectively.

In the case where you only want to visualize a subset of data, that can be done manually, using linear interpolation. For example, if a dataset spans an entire year, but you only want to animate between the months of February and June, you can adjust the input parameter to: 

```js
  torque(linear($month, 2, 6))
```

Similarly, if you have a timestamp property (`$date`), you can select a specific range using the [`time`](https://carto.com/developers/carto-vl/reference/#cartoexpressionstime) expression: 

```js
  torque(linear($date, time('2018-01-01T00:00:00'), time('2018-01-05T00:00:00'))
``` 

In both cases, the minimum value is mapped to `0` and the maximum value is mapped to `1`. Values outside of the specified range will not appear in the animation. 

#### Duration

This parameter defines the duration of the animation cycle in seconds. As stated above, during the animation cycle, all possible input values are evaluated. When an input value is matched, torque returns a value of `1` for the feature and it is drawn.

#### Fade

The `fade` parameter is used to define two additional (`fadeIn, fadeOut`) durations in seconds. These parameters allow for smooth transitions between features during an animation's duration. During the *`fadeIn`* phase, all features with a match will fade-in to the animation, transitioning from `0` (invisible) to `1` (visible). During the *`fadeOut`* phase features will transition from `1` back to `0` and the next set of features will begin to fade-in. 

### Example

To illustrate these concepts, we will animate the journey of three birds from January to April of 2014 using data from [movebank.org](https://www.movebank.org/).

#### Animate points

For the temporal component of the animation we will use the input `date_time` that has the date of the bird track and associated timestamp. We will set the duration to `30` and both fade parameters to `1`. 

```js
filter: torque($date_time,30,fade(1,1))
```
[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/animation/step-1.html)

#### Adjust duration

In the animation above, we can see that the birds spend the majority of this three month period in West Africa and then eventually migrate to Northern Europe. To see this happen more quickly in our animation, we'll adjust the duration to `10` seconds.

```js
filter: torque($date_time,10,fade(1,1))
```
[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/animation/step-2.html)

### Adjust fade

Since we are visualizing migration, we can adjust the `fade` parameters to give us a better sense of the journey these birds took. We will set the `fadeIn` parameter to `0` and the `fadeOut` parameter to `0.5`. What this does is keep the previous point in the animation visible for longer which helps us better visualize the path of migration. 

```js
filter: torque($date_time,10,fade(1,1))
```
[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/animation/step-3.html)

#### Final touches

Since we are visualizing the journey of three different birds, we can color each one with a unique color using `buckets`, decrease the `width` of the points to `4` and finally, remove the `strokeWidth` by setting it to `0`.

```js
filter: torque($date_time,10,fade(0,0.5))
color: ramp(buckets($bird_name,["Sanne","Eric","Nico"]),[deeppink,yellow,turquoise,gray])
width: 4
strokeWidth: 0
```
[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/animation/step-4.html)

