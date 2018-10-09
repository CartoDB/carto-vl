## Animate your visualizations

Using CARTO VL you can make animated maps of points, lines, and polygons using the [`animation`](https://carto.com/developers/carto-vl/reference/#cartoexpressionsanimation) expression. In this guide, you will learn how to make animations in your maps from scratch!

### Creating a basic animation

Let's start creating a simple animation showing and hiding dots in a map. The general syntax for animating data in CARTO VL is:

```js
const viz = new carto.Viz(`
    filter: animation(input, duration)
`);
```

In this first example, the `input` parameter is one of the columns name (`$date_time`) of the dataset (`bird_journey`). The duration is set to `30` seconds:

```js
const viz = new carto.Viz(`
    filter: animation($date_time, 30)
`);
```

<div class="example-map">
    <iframe
        id="animation-step-0"
        src="/developers/carto-vl/examples/maps/guides/animation/step-0.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

#### The filter property

Easy, right? Now it is time to understand deeply the animation expression.

In the example above, the animation expression is set to the `filter` property, defined in the [vizSpec](https://carto.com/developers/carto-vl/reference/#vizspec). The convention in CARTO VL is that `0` represents the boolean value `false`, (the absence of or an *off* state), while `1` represents `true` (the presence of or an *on* state). When the expression assigned to `filter` (`animation` in our case) has the value `0` for a given feature, that feature will be filtered-out and not be shown. If the value is `1`, the feature will be visible.

The `animation` expression acts like a clock, generating cyclic progress values over a determinate period to match the values of its input. When a match occurs between the input and the progress value animation returns a `1` value and otherwise it returns a `0'.

The next set of animation parameters are used to define the property, speed, and transition between animated features.

#### Input

The first animation parameter (input), is the attribute that you want to animate. By default, the cyclic animation progress varies from the attributes's minimum value
to its maximum.

#### Duration

This parameter defines the duration of the animation progress in seconds. As stated above, during the animation cycle, all possible input values are evaluated. When an input value is matched, animation returns a value of `1` for the feature and it is drawn.

#### Fade

The `fade` parameter is used to define two additional (`fadeIn, fadeOut`) durations in seconds. These parameters allow for smooth transitions between features during an animation's duration. During the *`fadeIn`* phase, all features with a match will fade-in to the animation, transitioning from `0` (invisible) to `1` (visible). During the *`fadeOut`* phase features will transition from `1` back to `0` and the next set of features will begin to fade-in.

### Styling and configuring the animation

To illustrate these concepts, let's animate the journey of three birds from January to April of 2014 using data from [movebank.org](https://www.movebank.org/).

#### Animating points

For the temporal component of the animation, you have to use the input `date_time` that has the date of the bird track and associated timestamp. Then, you have to set the duration to `30` and both fade parameters to `1`, so that the animation will repeat every 30 seconds and features will take 1 second to gradually become visible and another second
to disappear.

```js
const viz = new carto.Viz(`
    filter: animation($date_time, 30, fade(1, 1))
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

#### Adjusting the duration

In the animation above, we can see that the birds spend the majority of this three month period in West Africa and then eventually migrate to Northern Europe. To see this happen more quickly in our animation, we'll adjust the duration to `10` seconds.

```js
const viz = new carto.Viz(`
    filter: animation($date_time, 10, fade(1, 1))
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

#### Adjusting fade

Since this is a bird migration, it is possible to adjust the `fade` parameters to give us a better sense of the journey these birds took. The next step is to set the `fadeIn` parameter to `0` and the `fadeOut` parameter to `0.5`. What this does is keep the previous point in the animation visible for longer which helps us better visualize the path of migration.

```js
filter: animation($date_time, 10, fade(1, 1))
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

Since this visualization represents the journey of three different birds, it is possible to set a color for each type of bird with a unique color using `buckets` in a `ramp`, decrease the `width` of the points to `4` and finally, remove the `strokeWidth` by setting it to `0`. You can take a look to the previous [Data Driven Visualizations Guide](/developers/carto-vl/guides/0x-data-driven-visualizations.md) if you need to refresh these concepts.

```js
const viz = new carto.Viz(`
    filter: animation($date_time, 10, fade(0, 0.5))
    color: ramp(buckets($bird_name, ["Sanne", "Eric", "Nico"]),[deeppink, yellow, turquoise, gray])
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

Congratulations! You have created an animated visualization. Now it is time to control it! It means that you are going to learn how to add play and pause buttons, and also how to visualize the animation progress, between others.

#### Using variables

Let's continue with the previous example. First of all, you will have to use two variables in our Viz object: `@duration` and `@animation`. The `@duration` variable will let you access and modify the duration value, which is really useful when playing with the animation expression. Through the `@animation` variable you will be able to use the [animation methods](http://animation-guide.developers.carto-staging.com/developers/carto-vl/reference/#expressionsanimation)

```js
const viz = new carto.Viz(`
    @duration: 30
    @animation: animation($date_time, @duration, fade(1, 1))
    filter: @animation
`);
```

The different variables are available in the `viz` object you have just created. If you want to access the animation variable you can do it by typing `viz.variables.animation`. If you want to call an animation method, it is as simple as doing:

```js
viz.variables.animation.play();
```

#### Adding control elements

The next step to control the animation is to add buttons and elements that let you interact with it. These are the elements you have to add:

* **Progress** banner to display the animation progress.
* **Play** button to play or resume the animation.
* **Pause** button to pause the animation.
* **Duration** range slider to control the speed of the animation.

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

As you can see, there is an `id` attribute for each element that will let you access to this element using JavaScript like follows:

```js
const $progressRange = document.getElementById('js-progress-range');
const $playButton = document.getElementById('js-play-btn');
const $pauseButton = document.getElementById('js-pause-btn');
const $durationRange = document.getElementById('js-duration-range');
```

> Note: this guide makes use of some conventions. When setting an id to an element that is goint to be accessed in JavaScript, the id starts with `js`. In addition, when assiging the element (`const $progressBanner = document.getElementById('js-progress-banner')`), the JavaScript value starts with `$`, which indicates that it contains an HTML element.

#### Listening to events

You have to listen the interaction events with the different buttons in order to control the animation. This means that you have to, for example, tell your **Pause** button that it has to be ready and react when the user clicks on it to pause the animation.


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

In the same way, lets update the **duration** of the animation when the duration range changes:

```js
$durationRange.addEventListener('change', () => {
    viz.variables.duration = parseInt($durationRange.value, 10);
});
```

#### Updating the progress

You have learned how change the animation by interacting with the different buttons, but now you need to update the current progress of the animation, right? This function will be the one responsible of updating the progress range by updating the range value with the result of `getProgressPct()` method:

```js
function updateProgress () {
    $progressRange.value = viz.variables.animation.getProgressPct();
}
```

Lets call this function periodically using `setInterval`:

```js
setInterval(updateProgress, 100);
```

> Note: You can also do this by listening to layer events, but you will learn how to do so in the [Interactivity and Events Guide](09-interactivity-events.md)

#### All together

Well done! Here you have the full example with the controls. Feel free to play with it. Remember you can style your HTML controls using CSS. There is a more complete example [here](//TODO)

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

// TODO

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
