# Interactivity
With CARTO VL users can interact with the map in multiple ways. Thanks to vector technology animations can be created when the user clicks, moves or interacts with the map in multiple ways.

In this guide we will cover the basic aspects of user interaction.


## Interactivity Events

CARTO VL offers an [Interactivity object](https://carto.com/developers/carto-vl/reference/#cartointeractivity) that allows you to listen to several
map events in order to create rich interactive experiencies.

The following events are availiable:

- `featureClick`: Fired when the user clicks on features.
- `featureClickOut`: Fired when the user clicks outside a feature that was clicked in the last featureClick event.
- `featureHover`: Fired when the user moves the cursor over a feature.
- `featureEnter`: Fired the first time the user moves the cursor inside a feature.
- `featureLeave`: Fired the first time the user moves the cursor outside a feature.

For example, if you want to display an alert when the user clicks on a feature, you just need to create a new Interacitivty in the desired [Layer](https://carto.com/developers/carto-vl/reference/#cartolayer). And setup a callback for the `featureClick` event.


```js
const interactivity = new carto.Interactivity(layer);
interactivity.on('featureClick', featureEvent => alert('Feature clicked'));
```

This callback will be called with a single parameter of type [featureEvent](https://carto.com/developers/carto-vl/reference/#featureevent). This object will have the `position` and `coordinates` where the 
event happened and the list of [Features](https://carto.com/developers/carto-vl/reference/#feature) that have been interacted.

## Example: change the color on feature enter

<details>
  <summary>Full code</summary>

  ```html
<!DOCTYPE html>
<html>

<head>
    <title>Change color on feature enter | CARTO</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta charset="UTF-8">
    <!-- Include CARTO VL JS -->
    <script src="https://cartodb-libs.global.ssl.fastly.net/carto-vl/v0.3.0/carto-vl.js"></script>
    <!-- Include Mapbox GL JS -->
    <script src="https://cartodb-libs.global.ssl.fastly.net/mapbox-gl/v0.45.0-carto1/mapbox-gl.js"></script>
    <!-- Include Mapbox GL CSS -->
    <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.45.0/mapbox-gl.css" rel="stylesheet" />
    <style>
        #map {
            position: absolute;
            height: 100%;
            width: 100%;
        }
    </style>
</head>

<body>
    <div id="map"></div>
    <script>
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
            center: [-2, 40],
            zoom: 5,
            dragRotate: false
        });

        carto.setDefaultAuth({
            user: 'cartogl',
            apiKey: 'default_public'
        });

        const source = new carto.source.Dataset('ne_10m_populated_places_simple');
        const viz = new carto.Viz(`width: 15`);
        const layer = new carto.Layer('layer', source, viz);

        const interactivity = new carto.Interactivity(layer);
        interactivity.on('featureEnter', featureEvent => {
            featureEvent.features[0].color.blendTo('rgba(255, 0, 0, 0.5)', 100);
        });

        interactivity.on('featureLeave', featureEvent => {
            featureEvent.features[0].color.reset();
        });

        layer.addTo(map);
    </script>
</body>

</html>
```
</details>

As usual, we create a layer to display the `populated places` dataset:

```js
const source = new carto.source.Dataset('ne_10m_populated_places_simple');
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
    featureEvent.features[0].color.blendTo('rgba(255, 0, 0, 0.5)', 100);
});
```

By the other side, when the `featureLeave` event is fired we tell our callback to `reset` the color of the feature

```js
interactivity.on('featureLeave', featureEvent => {
    featureEvent.features[0].color.reset();
});
```


## Variables

The [featureEvent](https://carto.com/developers/carto-vl/reference/#featureevent) object has a special field called `variables`, this field
is used to get the values of the properties.

Initially this field will be empty and only variables present in the [Viz object](https://carto.com/developers/carto-vl/reference/#vizspec) will appear.

### Example: Display city name on click

<details>
  <summary>Full code</summary>

```html
<!DOCTYPE html>
<html>

<head>
    <title>Variables | CARTO</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta charset="UTF-8">
    <!-- Include CARTO VL JS -->
    <script src="https://cartodb-libs.global.ssl.fastly.net/carto-vl/v0.3.0/carto-vl.js"></script>
    <!-- Include Mapbox GL JS -->
    <script src="https://cartodb-libs.global.ssl.fastly.net/mapbox-gl/v0.45.0-carto1/mapbox-gl.js"></script>
    <!-- Include Mapbox GL CSS -->
    <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.45.0/mapbox-gl.css" rel="stylesheet" />
    <style>
        #map {
            position: absolute;
            height: 100%;
            width: 100%;
        }
    </style>
</head>

<body>
    <div id="map"></div>
    <script>
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
            center: [-2, 40],
            zoom: 5,
            dragRotate: false
        });

        carto.setDefaultAuth({
            user: 'cartogl',
            apiKey: 'default_public'
        });

        const source = new carto.source.Dataset('ne_10m_populated_places_simple');
        const viz = new carto.Viz(`
            @name: $name
            width: 15
        `);
        const layer = new carto.Layer('layer', source, viz);

        const interactivity = new carto.Interactivity(layer);
        interactivity.on('featureClick', featureEvent => {
            alert(featureEvent.features[0].variables.name.value)
        });

        layer.addTo(map);
    </script>
</body>

</html>
```
</details>

We want to display the city name when the user clicks on a feature, as usual we create a layer but this time we declare the `@name` variable
in the `Viz` object.

```js
const source = new carto.source.Dataset('ne_10m_populated_places_simple');
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


## Popups

<details>
  <summary>Full code</summary>

```html
<!DOCTYPE html>
<html>

<head>
    <title>Popups | CARTO</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta charset="UTF-8">
    <!-- Include CARTO VL JS -->
    <script src="https://cartodb-libs.global.ssl.fastly.net/carto-vl/v0.3.0/carto-vl.js"></script>
    <!-- Include Mapbox GL JS -->
    <script src="https://cartodb-libs.global.ssl.fastly.net/mapbox-gl/v0.45.0-carto1/mapbox-gl.js"></script>
    <!-- Include Mapbox GL CSS -->
    <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.45.0/mapbox-gl.css" rel="stylesheet" />
    <style>
        #map {
            position: absolute;
            height: 100%;
            width: 100%;
        }
    </style>
</head>

<body>
    <div id="map"></div>
    <script>
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
            center: [-2, 40],
            zoom: 5,
            dragRotate: false
        });

        carto.setDefaultAuth({
            user: 'cartogl',
            apiKey: 'default_public'
        });

        const source = new carto.source.Dataset('ne_10m_populated_places_simple');
        const viz = new carto.Viz(`
            @name: $name
            width: 20
        `);
        const layer = new carto.Layer('layer', source, viz);

        const interactivity = new carto.Interactivity(layer);
        interactivity.on('featureClick', featureEvent => {
            const coords = featureEvent.coordinates;
            const feature = featureEvent.features[0];
            if (!feature) {
                return;
            }
            new mapboxgl.Popup()
                .setLngLat([coords.lng, coords.lat])
                .setHTML(`<h1>${feature.variables.name.value}</h1>`)
                .addTo(map);
        });

        layer.addTo(map);
    </script>
</body>

</html>

```
</details>

Following the previous example, we create a layer to show the `populated_places` dataset with a variable for the `name`.

```js
const source = new carto.source.Dataset('ne_10m_populated_places_simple');
const viz = new carto.Viz(`
    @name: $name
    width: 20
`);
const layer = new carto.Layer('layer', source, viz);
```


Since we are using `mapbox.gl` to draw the basemap, we can use the [popup](https://www.mapbox.com/mapbox-gl-js/api#popup) object with our interactivity API.

All we need is to create a `popup` element in the callback of the `featureClick` event in our Interactivity object extracting the desired
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
