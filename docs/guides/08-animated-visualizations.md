## Animated visualizations
With CARTO VL you can make animated maps of points, lines and polygons using the [`animation`](/developers/carto-vl/reference/#cartoexpressionsanimation) expression. In this guide, you will learn how to make animated maps that tell a story by gaining a better understanding of how to adjust animation parameters based on the type of data you are mapping.

<div class="example-map">
    <iframe
        id="guides-animation-step-7"
        src="/developers/carto-vl/examples/maps/guides/animated-viz/step-7.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
You can explore this map [here](/developers/carto-vl/examples/maps/guides/animated-viz/step-7.html)

### Create a basic animation
Before getting into the details, it is important to understand the general syntax for animating data in CARTO VL:

```CARTO_VL_Viz
filter: animation(input, duration, fade(fadeIn, fadeOut))
```

We will walk through each part throughout this guide.

Using the syntax above, let’s create a basic animation where points appear and disappear on a map. We will use a `date_time` attribute (a time associated with each feature) as our `input`, set the `duration` to `10` seconds and set both `fade` parameters to `1` second.

The result is an animation that cycles through all of the records in the dataset over 10 seconds. Each point will take 1 second to become visible (_fade in_) and another second to disappear (_fade out_). You can see it in action in the next map.

```js
const viz = new carto.Viz(`
    filter: animation($date_time, 10, fade(1, 1))
`);
```

<div class="example-map">
    <iframe
        id="guides-animation-step-0"
        src="/developers/carto-vl/examples/maps/guides/animated-viz/step-0.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
You can explore this map [here](/developers/carto-vl/examples/maps/guides/animated-viz/step-0.html)

**Note:**
If you are wondering about the points, this is an animation of the journey of three birds, from January to April of 2014. It is using data from [movebank.org](https://www.movebank.org/) and the *date_time* column represents the date of the bird track and its associated timestamp. You can check the code of the previous map to see how to configure this *bird_journey* as the `carto.source.Dataset` for the visualization.


#### The filter property
Now that you have a basic map of animated points, you'll get a deeper understanding of the different pieces that make up the animation expression to fine-tune the visualization.

In the example above, the animation expression is set to the `filter` property (for more information see the [vizSpec](/developers/carto-vl/reference/#vizspec)).

The convention in CARTO VL is that:
* `0` represents the boolean value `false` (the *absence of* or an *off* state) and
* `1` represents `true` (the *presence of* or an *on* state).

In the context of an animation expression assigned to a `filter`, any feature that has a value of `0` will be “filtered-out” and not shown, while any feature that meets the filter is assigned a value of `1` and is shown.

You can think of the animation expression like a clock, cycling through each record of the input. Any time there is a match, the feature is drawn.

With this in mind, you can get a better understanding of the next set of animation parameters, and how they are used to define the property, speed, and transition between animated features.


#### Input
The first animation parameter (`input`), is the attribute that you want to animate. By default, the animation progresses from the attribute minimum to maximum values.

#### Duration
This parameter defines the duration of the animation in seconds. As stated above, during the animation cycle, all possible input values are evaluated. When an input value is matched, animation returns a value of `1` for the feature and it is drawn.

#### Fade
The `fade` parameter is used to define two additional (`fadeIn, fadeOut`) durations in seconds. These parameters allow for smooth transitions between features during the animation. During the *`fadeIn`* phase, all features with a match will fade-in to the animation, transitioning from `0` (invisible) to `1` (visible). During the *`fadeOut`* phase features will transition from `1` back to `0` and the next set of features will begin to fade-in.

### Style and configure the animation
To illustrate these concepts, we'll keep on working on the animated journey of our three birds.

#### Animate points
At the beginning of the guide, we created a simple point animation using the attribute `$date_time` for the temporal input, set the duration to `10` seconds and both fade parameters to `1` second:

```js
const viz = new carto.Viz(`
    filter: animation($date_time, 10, fade(1, 1))
`);
```

<div class="example-map">
    <iframe
        id="guides-animation-step-1"
        src="/developers/carto-vl/examples/maps/guides/animated-viz/step-1.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>


#### Adjust the duration
In the animation above, you will notice that the birds spend the majority of this three month period in West Africa and then eventually migrate to Northern Europe. To see the journey in more detail, try adjusting the duration to `30` seconds. With this adjustment that slows down the animation, you can see that each bird, at a different time, flies north along the coast of Morocco to Eastern Europe.

```js
const viz = new carto.Viz(`
    filter: animation($date_time, 30, fade(1, 1))
`);
```

<div class="example-map">
    <iframe
        id="guides-animation-step-2"
        src="/developers/carto-vl/examples/maps/guides/animated-viz/step-2.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
You can explore this map [here](/developers/carto-vl/examples/maps/guides/animated-viz/step-2.html)

#### Adjust fade
Since you are visualizing bird migration, the journey the birds took should be shown more clearly through symbology. You can get this added effect by adjusting the `fade` parameters. By setting `fadeIn` to `0` and `fadeOut` to `0.5`, the previous point from the journey is visible for longer in the animation which helps to better visualize the flight path of the migration journey.

```CARTO_VL_Viz
filter: animation($date_time, 30, fade(0, 0.5))
```

<div class="example-map">
    <iframe
        id="guides-animation-step-3"
        src="/developers/carto-vl/examples/maps/guides/animated-viz/step-3.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
You can explore this map [here](/developers/carto-vl/examples/maps/guides/animated-viz/step-3.html)


#### Final touches
Assigning unique colors to each of the three birds helps visualize each one's journey better. Using their names, you can assign a unique color to each one using `buckets` inside of a `ramp`. Next, decrease the `width` of the points to `4` and finally, remove the `strokeWidth` by setting it to `0`.

**Note:**
For a more in-depth discussion of ramps and other styling properties, check out our [Data-driven visualizations guide - part 1](/developers/carto-vl/guides/data-driven-visualizations-part-1/).

```js
const viz = new carto.Viz(`
    filter: animation($date_time, 10, fade(0, 0.5))
    color: ramp(buckets($bird_name, ["Sanne", "Eric", "Nico"]), [deeppink, yellow, turquoise])
    width: 4
    strokeWidth: 0
`);
```

<div class="example-map">
    <iframe
        id="guides-animation-step-4"
        src="/developers/carto-vl/examples/maps/guides/animated-viz/step-4.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
You can explore the final map [here](/developers/carto-vl/examples/maps/guides/animated-viz/step-4.html)


### Animation controls
Congratulations! You have created an animated visualization.

To complete the map, you can add animation controls to play and pause the animation as well as a slider bar to adjust the duration of the animation on-the-fly.


#### Add variables
To get started, add two variables inside of the Viz object: `@duration` and `@animation`. Making the duration of the animation a variable (`@duration`) and putting that inside of the animation expression will allow you to dynamically modify the duration of the animation using the controls on the map.
```js
const viz = new carto.Viz(`
    @duration: 30
    @animation: animation($date_time, @duration, fade(0, 0.5))
    filter: @animation
`);
```

The variables are now available in the `viz` object. If you want to access the animation variable you can do it by typing `viz.variables.animation`. By assigning the animation expression to the `@animation` variable, you are going to be able to call its [public methods](/developers/carto-vl/reference/#expressionsanimation) as follows:

```js
viz.variables.animation.play();
```

#### Add animation controls
The next step is to add buttons and elements that allow you to control and interact with the animation.

The elements we will add are:
* **Progress**: a slider that shows the time progression of the animation (`js-progress-range`).
* **Play**: a button to play or resume the animation (`js-play-button`).
* **Pause**: a button to pause the animation (`js-pause-button`).
* **Duration**: a slider to control the length of the animation (`js-duration-range`).
* **Current**: a text to display the current timestep of the animation (`js-current-time`).

To display the controls, you're going to create a panel. You have to add this just under the map, like this:
```html
<div id="map"></div>
<!-- Animation control elements -->
<aside>
    <header>
        <h1>Animation controls</h1>
    </header>
    <section>
        <p>Progress: <input type="range" id="js-progress-range" min="0" max="1" step="0.01"></p>
    </section>
    <section>
        <p>Current: <span id="js-current-time" class="open-sans"></span></p>
    </section>
    <section>
        <button id="js-play-button">Play</button>
        <button id="js-pause-button">Pause</button>
        <input type="range" id="js-duration-range" min="1" max="30" step="1">
    </section>
</aside>
```

As seen above, there is an `id` attribute assigned to each element which you can use to access using JavaScript:

```js
const $progressRange = document.getElementById('js-progress-range');
const $playButton = document.getElementById('js-play-btn');
const $pauseButton = document.getElementById('js-pause-btn');
const $durationRange = document.getElementById('js-duration-range');
const $currentTime = document.getElementById('js-current-time');
```

**Note:**
This guide makes use of some conventions. When setting an `id` to an element that is going to be accessed via JavaScript, the `id` starts with `js`. In addition, when assigning the element (`const $progressBanner = document.getElementById('js-progress-banner')`), the JavaScript value starts with `$`, which indicates that it contains an HTML element.


#### Add listening events
In this step, you will add listening events tied to the different interaction buttons used to control the animation as described above. For example, you will tell the **Pause** button that it has to be ready and react when clicked to pause the animation.

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

In the same way, you can update the **duration** of the animation when the duration range is adjusted in the slider:

```js
$durationRange.addEventListener('change', () => {
    viz.variables.duration = parseInt($durationRange.value, 10);
});
```


#### Update the progress bar
Now that you have added the listening events for the different buttons and defined the behavior upon interaction, next you will walk through updating the progress bar and the current time text.

The `updateProgress` function will be responsible for:
- updating the progress bar through the duration of the animation, using the range value provided by the `getProgressPct()` method and
- displaying the current time, by updating a span with the current `getProgressValue()` method:

```js
function updateProgress () {
    $progressRange.value = viz.variables.animation.getProgressPct();
    $currentTime.innerText = viz.variables.animation.getProgressValue();
}
```

Let’s call this function periodically by using `setInterval`:

```js
setInterval(updateProgress, 100);
```

**Note:**
The `setInterval()` is a common method available at the browser, that calls a function or evaluates an expression at specified intervals, in milliseconds. You can also do this update by listening to `carto.layer` events. This topic is covered more in-depth in the [Add interactivity and events Guide](/developers/carto-vl/guides/add-interactivity-and-events/); once you know how, the second options is preferred.


#### All together
Well done! In the example below you will find the full code, including the animation controls. You can play with it and make adjustments.

Remember you can style your HTML controls using CSS. These styles are very simple, but at the beginning of this guide you have a complete example that includes beautiful styles. A similar example is available in the [examples section](/developers/carto-vl/examples/#example-animation-controls).

<div class="example-map">
    <iframe
        id="guides-animation-step-5"
        src="/developers/carto-vl/examples/maps/guides/animated-viz/step-5.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
You can explore this map [here](/developers/carto-vl/examples/maps/guides/animated-viz/step-5.html)

```js
const map = new mapboxgl.Map({
    container: 'map',
    style: carto.basemaps.darkmatter,
    center: [-0.12796893854942937, 35.1654623242204],
    zoom: 2.8,
    scrollZoom: false
});

const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');

carto.setDefaultAuth({
    username: 'cartovl',
    apiKey: 'default_public'
});

const source = new carto.source.Dataset('bird_journey');

// Define Animation
const viz = new carto.Viz(`
    @duration: 30
    @animation: animation($date_time, @duration, fade(0, 0.5))
    filter: @animation
    width: 4
    strokeWidth: 0
    color: #1785FB
`);

const layer = new carto.Layer('layer', source, viz);

// Get animation control elements
const $progressRange = document.getElementById('js-progress-range');
const $playButton = document.getElementById('js-play-button');
const $pauseButton = document.getElementById('js-pause-button');
const $durationRange = document.getElementById('js-duration-range');
const $currentTime = document.getElementById('js-current-time');

// Listen to interaction events with the UI
$playButton.addEventListener('click', () => {
    viz.variables.animation.play();
});

$pauseButton.addEventListener('click', () => {
    viz.variables.animation.pause();
});

$durationRange.addEventListener('change', () => {
    viz.variables.duration = parseInt($durationRange.value, 10);
});

// Update progress bar each 100 milliseconds
function updateProgress () {
    $progressRange.value = viz.variables.animation.getProgressPct();
    $currentTime.innerText = viz.variables.animation.getProgressValue();
}

setInterval(updateProgress, 100);

layer.addTo(map);
```

<hr/>

### Taking it further
In this section, we explore other properties that can be used for your animation, including how to animate only a subset of the data and how to symbolize that time range with color.

In the examples above, we are animating the entire timespan of the bird journeys using `$date_time` as our input. If we want to only visualize a subset of the timespan, we can change the input range of values using a `linear` expression combined with a [`time`](/developers/carto-vl/reference/#cartoexpressionstime) expression:

```js
const viz = new carto.Viz(`
    filter: animation(linear($date_time, time('2018-01-01T00:00:00'), time('2018-01-05T00:00:00'))
`);
```

**Note:**
Values outside of the specified range will not appear in the animation.

This isn’t only limited to timestamp properties. If your input property is a number, for example the month of the year ranging from `1-12`, you can adjust the input parameter to that attribute (`$month`) and define the min and max range (`2,6`) that you want to visualize:

```js
const viz = new carto.Viz(`
    filter: animation(linear($month, 2, 6))
`);
```

You can also apply the same time range (`@timeSteps`) to other properties like color using a `ramp` expression. That double-encoding of the same time dimension, within the filter and the color, will reinforce the expressiveness of the visualization:

```js
const viz = new carto.Viz(`
    @duration: 10
    @animation: animation(@timeSteps, @duration, fade(0, 0.5))
    @timeSteps: linear($date_time, time('2014-03-30T20:24:25Z'), time('2014-04-24T23:52:14Z'))
    color: ramp(@timeSteps, SunsetDark)
    filter: @animation
    width: 10
    strokeWidth: 0
`);
```

As you can see in the result, you are able to visualize, via color, where each bird is at the same time range in the data and get some interesting insights about their individual and combined journey.

<div class="example-map">
    <iframe
        id="guides-animation-step-7"
        src="/developers/carto-vl/examples/maps/guides/animated-viz/step-7.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
You can explore the final step [here](/developers/carto-vl/examples/maps/guides/animated-viz/step-7.html)
