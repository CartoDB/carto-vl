## Introduction to Interactivity

With CARTO VL users can interact with the map in multiple ways. Thanks to vector technology animations can be created when the user clicks, moves or interacts with the map in multiple ways.

In this guide we will cover the basic aspects of user interaction.

### Interactivity events

CARTO VL offers an [Interactivity object](https://carto.com/developers/carto-vl/reference/#cartointeractivity) that allows you to listen to several
map events in order to create rich interactive experiences.

The following events are available:

- `featureClick`: Fired when the user clicks on features.
- `featureClickOut`: Fired when the user clicks outside a feature that was clicked in the last featureClick event.
- `featureHover`: Fired when the user moves the cursor over a feature.
- `featureEnter`: Fired the first time the user moves the cursor inside a feature.
- `featureLeave`: Fired the first time the user moves the cursor outside a feature.

For example, if you want to display an alert when the user clicks on a feature, you just need to create a new Interactivity in the desired [Layer](https://carto.com/developers/carto-vl/reference/#cartolayer). And setup a callback for the `featureClick` event.


```js
const interactivity = new carto.Interactivity(layer);
interactivity.on('featureClick', featureEvent => alert('Feature clicked'));
```

This callback will be called with a single parameter of type [featureEvent](https://carto.com/developers/carto-vl/reference/#featureevent). This object will have the `position` and `coordinates` where the
event happened and the list of [Features](https://carto.com/developers/carto-vl/reference/#feature) that have been interacted.

#### Example: change the color on feature enter

[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/interactivity/featureEnter.html)

As usual, we create a layer to display the `populated places` dataset:

```js
const source = new carto.source.Dataset('populated_places');
const viz = new carto.Viz(`width: 15`);
const layer = new carto.Layer('layer', source, viz);
```

Then we create an [Interactivity object](https://carto.com/developers/carto-vl/reference/#cartointeractivity) passing this layer as a parameter


```js
const interactivity = new carto.Interactivity(layer);
```

Then we set up a listener for the `featureEnter` in the Interactivity object, this listener will change the color of the first
feature included in the `features` array.

```js
interactivity.on('featureEnter', featureEvent => {
    featureEvent.features[0].color.blendTo('rgba(0, 255, 0, 0.8)', 100);
});
```

When the `featureLeave` event is fired we tell our callback to `reset` the color of the feature

```js
interactivity.on('featureLeave', featureEvent => {
    featureEvent.features[0].color.reset();
});
```

### Variables

The [featureEvent](https://carto.com/developers/carto-vl/reference/#featureevent) object has a special field called `variables`, this field
is used to get the values of the properties.

Initially this field will be empty and only variables present in the [Viz object](https://carto.com/developers/carto-vl/reference/#vizspec) will appear.

#### Example: Display city name on click

[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/interactivity/variables.html)

We want to display the city name when the user clicks on a feature, as usual we create a layer but this time we declare the `@name` variable
in the `Viz` object.

```js
const source = new carto.source.Dataset('populated_places');
const viz = new carto.Viz(`
    @name: $name
    width: 15
`);
const layer = new carto.Layer('layer', source, viz);
```

Then we create an Interactivity object defining a callback for the  `featureClick` event, this callback will use `variables.name.value` property
to show the name of the clicked city.

```js
const interactivity = new carto.Interactivity(layer);
interactivity.on('featureClick', featureEvent => {
    alert(featureEvent.features[0].variables.name.value)
});
```

### Pop-ups

[Live example](http://carto.com/developers/carto-vl/examples/maps/guides/interactivity/popups.html)

Following the previous example, we create a layer to show the `populated_places` dataset with a variable for the `name`.

```js
const source = new carto.source.Dataset('populated_places');
const viz = new carto.Viz(`
    @name: $name
    width: 20
`);
const layer = new carto.Layer('layer', source, viz);
```

Since we are using `mapbox.gl` to draw the basemap, we can use the [pop-up](https://www.mapbox.com/mapbox-gl-js/api#popup) object with our interactivity API.

All we need is to create a `pop-up` element in the callback of the `featureClick` event in our Interactivity object extracting the desired
fields from the `featureEvent`.

```js
const interactivity = new carto.Interactivity(layer);
interactivity.on('featureClick', featureEvent => {
    const coords = featureEvent.coordinates;
    const feature = featureEvent.features[0];
    new mapboxgl.Popup()
        .setLngLat([coords.lng, coords.lat])
        .setHTML(`<h1>${feature.variables.name.value}</h1>`)
        .addTo(map);
});
```
