## Animated visualizations

With CARTO VL you can make animated maps of points, lines, and polygons using the [`animation`](https://carto.com/developers/carto-vl/reference/#cartoexpressionsanimation) expression. In this guide, you will learn how to make animated maps that tell a story by gaining a better understanding of how to adjust animation parameters based on the type of data you are mapping.

<div class="example-map">
    <iframe
        id="animation-step-7"
        src="/developers/carto-vl/examples/maps/guides/animation/step-7.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

### Create a basic animation

Before we begin, it is important to understand the general syntax for animating data in CARTO VL:

`filter: animation(input, duration, fade(fadeIn, fadeOut))`


We will walk through each part in more detail throughout this guide.

Using the syntax above, let’s create a basic animation where points appear and disappear on a map. 

We will use the attribute `date_time` (a record of time when a data point was collected) as our input, set the duration of the animation to `10` seconds and set both fade parameters to `1`. 

```js
const viz = new carto.Viz(`
    filter: animation($date_time, 10, fade(1,1))
`);
```

The result is an animation that cycles through all of the records in the data over 10 seconds. Each point will take 1 second to become visible (fade in) and another second to disappear (fade out).


```js
const viz = new carto.Viz(`
    filter: animation($date_time, 10, fade(1,1))
`);
```

<div class="example-map">
    <iframe
        id="animation-step-0"
        src="/developers/carto-vl/examples/maps/guides/animation/step-0.html"
        width="100%"
        height="500"a
        frameBorder="0">
    </iframe>
</div>

#### The filter property


Now that we have a basic map of animated points, let’s get a deeper understanding of the different pieces that make up the animation expression to fine-tune the visualization.

In the example above, the animation expression is set to the `filter` property (for more information see the[vizSpec](https://carto.com/developers/carto-vl/reference/#vizspec)). The convention in CARTO VL is that `0` represents the boolean value `false`, (the absence of or an *off* state), while `1` represents `true` (the presence of or an *on* state). In the context of an  animation expression assigned to a `filter`, any feature that has a  value of `0` will be “filtered-out” and not shown while any feature that meets the filter, is assigned a value of `1` and is shown. 

You can think of the  animation expression like a clock, cycling through each record of the input.  Any time there is a match, ,  the feature is drawn.  Now that we’ve gone through a more in-depth discussion of how features draw, let’s take a look at the next set of animation parameters are used to define the property, speed, and transition between animated features.

#### Input

The first animation parameter (input), is the attribute that you want to animate. By default, the animation progresses from the attribute minimum to maximum values.
#### Duration

This parameter defines the duration of the animation progress in seconds. As stated above, during the animation cycle, all possible input values are evaluated. When an input value is matched, animation returns a value of `1` for the feature and it is drawn.

#### Fade

The `fade` parameter is used to define two additional (`fadeIn, fadeOut`) durations in seconds. These parameters allow for smooth transitions between features during an animation's duration. During the *`fadeIn`* phase, all features with a match will fade-in to the animation, transitioning from `0` (invisible) to `1` (visible). During the *`fadeOut`* phase features will transition from `1` back to `0` and the next set of features will begin to fade-in.

### Style and configure the animation

To illustrate these concepts, let's animate the journey of three birds from January to April of 2014 using data from [movebank.org](https://www.movebank.org/).

#### Animate points

At the beginning of the guide we created a simple point animation using the attribute `$date_time` for the temporal input (the date of the bird track and associated timestamp), set the duration to `10` seconds and both fade parameters to `1`. 

```js
const viz = new carto.Viz(`
    filter: animation($date_time, 10, fade(1, 1))
`);
```

<div class="example-map">
    <iframe
        id="animation-step-1"
        src="/developers/carto-vl/examples/maps/guides/animation/step-1.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

#### Adjust the duration

In the animation above, we can see that the birds spend the majority of this three month period in West Africa and then eventually migrate to Northern Europe. To see the journey in more detail, we'll adjust the duration to `30` seconds. Now looking at the map, we can see that each bird, at a different time, flies north along the coast of Morocco to Eastern Europe.

```js
const viz = new carto.Viz(`
    filter: animation($date_time, 30, fade(1, 1))
`);
```

<div class="example-map">
    <iframe
        id="animation-step-2"
        src="/developers/carto-vl/examples/maps/guides/animation/step-2.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

#### Adjust fade

Since we are visualizing  bird migration, we want to show more clearly, through symbology, the journey the birds took. We can get this added effect by adjusting  the`fade` parameters. By setting `fadeIn` to `0` and `fadeOut` to `0.5`, we  keep the previous point in the animation visible for longer which helps us better visualize the flight path of the migration journey.

```js
filter: animation($date_time, 30, fade(0, 0.5))
```

<div class="example-map">
    <iframe
        id="animation-step-3"
        src="/developers/carto-vl/examples/maps/guides/animation/step-3.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

#### Final touches

Since this visualization represents the journey of three different birds, we can assign  a unique color to  each one  using their names to define `buckets` inside of a `ramp`.decrease the `width` of the points to `4` and finally, remove the `strokeWidth` by setting it to `0`. 

*Note:*
For a more in-depth discussion of ramps and other styling properties, check out our [Data Driven Visualizations Guide](/developers/carto-vl/guides/0x-data-driven-visualizations.md). 

```js
const viz = new carto.Viz(`
    filter: animation($date_time, 10, fade(0, 0.5))
    color: ramp(buckets($bird_name, ["Sanne", "Eric", "Nico"]),[deeppink, yellow, turquoise])
    width: 4
    strokeWidth: 0
`);
```

<div class="example-map">
    <iframe
        id="animation-step-4"
        src="/developers/carto-vl/examples/maps/guides/animation/step-4.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

### Adding controls to your animation

Congratulations! You have created an animated visualization. 

Next, let’s add some animation controls to play and pause the animation as well as a slider to adjust the speed of the animation on-the-fly. 
#### Add variables

Continuing with our map of bird migration, we will add  two variables in our Viz object: `@duration` and `@animation`. The `@duration` variable defines how to modify the duration value, which is really useful for playing with the animation expression.
```js
const viz = new carto.Viz(`
    @duration: 30
    @animation: animation($date_time, @duration, fade(0, 0.5))
    filter: @animation
`);
```

The different variables are available in the `viz` object you have just created. If you want to access the animation variable you can do it by typing `viz.variables.animation`. By assigning the animation expression to the `@animation` variable, you are going to be able to call the [public methods](http://animation-guide.developers.carto-staging.com/developers/carto-vl/reference/#expressionsanimation) as follows:

```js
viz.variables.animation.play();
```

#### Add control elements

The next step is to add buttons and elements that allow you to control and interact with the animation. 

The   elements we will add are:

* **Progress** slider to display the animation progress.
* **Play** button to play or resume the animation.
* **Pause** button to pause the animation.
* **Duration** slider to control the speed of the animation.

```html
<aside>
    <header>
        <h1>Animation controls</h1>
    </header>
    <section>
        <p>Progress: <input type="range" id="js-progress-range" min="0" max="1" step="0.01"></p>
    </section>
    <section>
        <button id="js-play-button">Play</button>
        <button id="js-pause-button">Pause</button>
        <input type="range" id="js-duration-range" min="0" max="30" step="1">
    </section>
</aside>
```

As seen above, there is an `id` attribute assigned to  each element giving us access to each one using JavaScript:

```js
const $progressRange = document.getElementById('js-progress-range');
const $playButton = document.getElementById('js-play-btn');
const $pauseButton = document.getElementById('js-pause-btn');
const $durationRange = document.getElementById('js-duration-range');
```

> Note: this guide makes use of some conventions. When setting an `id` to an element that is going to be accessed via JavaScript, the `id` starts with `js`. In addition, when assigning the element (`const $progressBanner = document.getElementById('js-progress-banner')`), the JavaScript value starts with `$`, which indicates that it contains an HTML element.

#### Add listening events 

In this step, we will add listening events tied to the different  interaction buttons used  to control the animation. For example, we will tell the **Pause** button that it has to be ready and react when clicked  to pause the animation.

```js
$pauseButton.addEventListener('click', () => {
    viz.variables.animation.pause();
});
```

And the same applies to the **Play** button:

```js
$playButton.addEventListener('click', () => {
    viz.variables.animation.play();
});
```

In the same way, we can  update the **duration** of the animation when the duration range is adjusted in the slider:

```js
$durationRange.addEventListener('change', () => {
    viz.variables.duration = parseInt($durationRange.value, 10);
});
```

#### Update the progress

You have learned how change the animation by interacting with the different buttons, and now you are going learn how to update the current progress of the animation. This function will be the one responsible of updating the progress range by updating the range value with the result of `getProgressPct()` method:

```js
function updateProgress () {
    $progressRange.value = viz.variables.animation.getProgressPct();
}
```

Let’s call this function periodically by using `setInterval`:

```js
setInterval(updateProgress, 100);
```

> Note: You can also do this by listening to layer events, you will learn how to use these events in the [Interactivity and Events Guide](09-interactivity-events.md)

#### All together

Well done! In the example below you will find the full code, including with the animation controls. You can play with it and make adjustments.

Remember you can style your HTML controls using CSS. These styles are very simple, but at the beginning of this guide you have a complete example that includes beautiful styles. This example is also available in the [examples section](http://carto.com/developers/carto-vl/examples/#example-animation-controls).

<div class="example-map">
    <iframe
        id="animation-step-5"
        src="/developers/carto-vl/examples/maps/guides/animation/step-5.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

```js
const map = new mapboxgl.Map({
    container: 'map',
    style: carto.basemaps.darkmatter,
    center: [-8.291255, 33.684553],
    zoom: 2.8,
    scrollZoom: false
});

map.touchZoomRotate.disableRotation();

const nav = new mapboxgl.NavigationControl({
    showCompass: false
});

map.addControl(nav, 'top-left');

// Autenticate the client
carto.setDefaultAuth({
    username: 'cartovl',
    apiKey: 'default_public'
});

// Create the source
const source = new carto.source.Dataset('bird_journey');

// Add better styles
const viz = new carto.Viz(`
    @duration: 30
    @animation: animation($date_time, @duration, fade(1, 1))
    filter: @animation
    width: 4
    strokeWidth: 0
    color: #1785FB
`);

// Create the layer
const layer = new carto.Layer('layer', source, viz);

// Get animation control elements
const $progressRange = document.getElementById('js-progress-range');
const $playButton = document.getElementById('js-play-button');
const $pauseButton = document.getElementById('js-pause-button');
const $durationRange = document.getElementById('js-duration-range');

// Listen to interaction events
$playButton.addEventListener('click', () => {
    viz.variables.animation.play();
});

$pauseButton.addEventListener('click', () => {
    viz.variables.animation.pause();
});

$durationRange.addEventListener('change', () => {
    viz.variables.duration = parseInt($durationRange.value, 10);
});

// Update progress each 100 milliseconds
function updateProgress () {
    $progressRange.value = viz.variables.animation.getProgressPct();
}

setInterval(updateProgress, 100);

// Add the layer to the map
layer.addTo(map);
```

### Advanced animations

In this section, you will learn other properties that can be used to animate the visualization. You can change the input range of values by using a `linear` expression, and thus visualize a subset of the data. For example, if a dataset spans an entire year, but you only want to animate between the months of February and June, you can adjust the input parameter to:

```js
const viz = new carto.Viz(`
    animation(linear($month, 2, 6))
`);
```

Similarly, if you have a timestamp property (`$date`), you can select a specific range using the [`time`](https://carto.com/developers/carto-vl/reference/#cartoexpressionstime) expression:

```js
const viz = new carto.Viz(`
    animation(linear($date_time, time('2018-01-01T00:00:00'), time('2018-01-05T00:00:00'))
`);
```

> Note: Values outside of the specified range will not appear in the animation.

```js
const viz = new carto.Viz(`
    @duration: 10
    @linearAnimation: animation(linear($date_time, time('2014-03-30T20:24:25Z'), time('2014-04-24T23:52:14Z')), @duration)
    color: ramp(@linearAnimation, Oryel)
    filter: @linearAnimation
    width: 10
    strokeWidth: 0
`);
```

You can apply the animation to the color property by using it in the `ramp` expression. Take a look at the result:

<div class="example-map">
    <iframe
        id="animation-step-6"
        src="/developers/carto-vl/examples/maps/guides/animation/step-6.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>
