## Add data sources
In this guide you will learn how to use different data sources in your CARTO VL visualizations. After finishing this guide, you will be able to connect to datasets in several ways, and know which option is best for you.

This guide assumes that you have previously gone through the [Getting Started Guide](/developers/carto-vl/guides/getting-started) and know how to make a basic map.

By the end of this guide, you will be able to create this CARTO VL map:

<div class="example-map">
    <iframe
        id="guides-sources-step-final"
        src="/developers/carto-vl/examples/maps/guides/add-data-sources/step-3.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>

### Supported data types
CARTO VL is a library that visualizes geographical datasets in a powerful and flexible way. Those datasets can be yours or they can be served by some other provider, but the first step to know is where they are hosted and how they can be accessed.

CARTO VL currently supports these three options:
* **Dataset**: a vector dataset hosted by CARTO and available with your credentials (for example, a dataset with all the *stores in your city*).
* **GeoJSON**: a vector dataset in GeoJSON format.
* **SQL**: a Dataset with a SQL query applied to it (e.g. just the *stores with > 500 sq meters*).

Every option is a different kind of **Source**, and CARTO VL provides you with a suitable object in its API to connect to them under the namespace `carto.source` (for example `carto.source.Dataset`).

Both *Dataset* and *SQL* are based in [Vector Tiles](https://carto.com/help/glossary/#vectortile), following the *Mapbox Vector Tile Specification* or [MVT](https://www.mapbox.com/vector-tiles/specification/). This advanced technology allows transferring geographic data from the server to your browser in small chunks, allowing good performance and powerful dynamic styling.
> In fact, there is a fourth type of source in CARTO VL called [carto.source.MVT](/developers/carto-vl/reference/#cartosourcemvt) but it is not meant to be used directly by the users, except in very precise / advanced cases.

### Getting started
In the following section you will see how to use three main source types. Before getting started with that, you will need to create a basic map.

You can start from this [basemap](/developers/carto-vl/examples/maps/guides/getting-started/step-1.html). Go ahead and copy its source code into a new file called `sources.html`.
> To copy the source code from an example, you just have to navigate to it with your browser, click right button > `View source` and copy the whole text, from `<html>` to `</html>` tags.

Next, to warm up, add navigation controls, just after the map creation:
```js
const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');
```

### Dataset source
A `Dataset` can be managed using [carto.source.Dataset](/developers/carto-vl/reference/#cartosourcedataset). It is a source with geographic information related to a specific topic (such as *stores*, *streets* or *counties*). If you have a GIS background, this is like a local vector file with points, lines or polygons, hosted in CARTO. If you don't, you can think of it as a table on the server with a geometry field you can use to draw it on a map.

#### Add a Dataset source
You already know how to add a `Dataset` thanks to the *Getting Started* guide:
```js
const aSource = new carto.source.Dataset('name_of_your_dataset');
```
That was using `carto.setDefaultAuth` method, but now you will see how to include custom credentials for a specific dataset. Add this to your current working file (*sources.html* if you followed our suggestion), just after map creation.
```js
const citiesSource = new carto.source.Dataset('populated_places', {
    username: 'cartovl',
    apiKey: 'default_public'
});
```

As with any `Source`, you should then pass it to a `Layer` to visualize it, but first let's create its Viz with a simple style:
```js
const citiesViz = new carto.Viz(`
    color: grey
    width: 4
`);
```

Now you're ready for the layer creation:
```js
const citiesLayer = new carto.Layer('cities', citiesSource, citiesViz);
```
> It is a good practice to give them a short but clear name, like 'cities'

And now you can add that layer to the map, by including this code:
```js
citiesLayer.addTo(map);
```

The result should look like this:
<div class="example-map">
    <iframe
        id="guides-sources-step-1"
        src="/developers/carto-vl/examples/maps/guides/add-data-sources/step-1.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>

#### When to use a Dataset source?
You have a CARTO account, with several custom datasets, and you want to visualize one of them on a map, with all its rows.

### GeoJSON source
A `GeoJSON` can be used in CARTO VL with [carto.source.GeoJSON](/developers/carto-vl/reference/#cartosourcegeojson). GeoJSON is a standard format to encode geographic data using JavaScript. It is indeed a common JSON, extended with spatial features, and you can create some *.geojson* contents online at [geojson.io](http://geojson.io/).

#### Add a GeoJSON source
In the next set of steps, you'll create a new GeoJSON layer, to visualize the main *CARTO offices* around the world.

You can include GeoJSON content and embed it directly in your JavaScript, like this:
```js
const offices = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-73.944158, 40.678178]
            },
            "properties": {
                "address": "Brooklyn, New York"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-3.70379, 40.416775]
            },
            "properties": {
                "address": "Madrid, Spain"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-0.127758, 51.507351]
            },
            "properties": {
                "address": "London, United Kingdom"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-77.036871, 38.907192]
            },
            "properties": {
                "address": "Washington, DC"
            }
        }
    ]
};
```
> If your dataset is much bigger, you would probably store that content in an external file (see this [External GeoJSON layer](/developers/carto-vl/examples/#example-external-geojson-layer) example).

And then use it within a GeoJSON source, like this:
```js
const officesSource = new carto.source.GeoJSON(offices);
```

Create a custom style for the layer:
```js
const officesViz = new carto.Viz(`
    color: red
    width: 20
`);
```

Define a map layer:
```js
const officesLayer = new carto.Layer('offices', officesSource, officesViz);
```

And finally add that layer to the map:
```js
officesLayer.addTo(map);
```

Now the map should look like this:
<div class="example-map">
    <iframe
        id="guides-sources-step-2"
        src="/developers/carto-vl/examples/maps/guides/add-data-sources/step-2.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>

#### When to use a GeoJSON source?
You already have your data in GeoJSON format, and you don't have access to a CARTO account (if you do have a CARTO account, you should import it to get a better performance and more capabilities, and then use a `Dataset` source). This can also be a useful format for some quick tests, using inline GeoJSON if you are managing just a few rows or a *.geojson* file just next to your *.html*.

### SQL source
SQL is a very common language to make queries in databases and geospatial software. It provides a flexible mechanism to adapt your dataset to your specific needs. 

#### Add a SQL source
Let's see how to add a SQL source to your map!

Define a query (select only the largest cities (`megacity`) in the world from the `populated_places` dataset):
```js
const query = 'SELECT * FROM populated_places WHERE megacity = 1';
```
> This is a simple query but the SQL runs on CARTO's backend, which is powered by PostGIS, so you could also execute more sophisticated queries and even spatial analysis.

Create a SQL source:
```js
const megacitiesSource = new carto.source.SQL(query, {
    username: 'cartovl',
    apiKey: 'default_public'
});
```

Define the new style:
```js
const megacitiesViz = new carto.Viz('color: blue');
```

Create a common layer with those selected `megacities`:
```js
const megacitiesLayer = new carto.Layer('megacities', megacitiesSource, megacitiesViz);
```

And finally add this layer to the map:
```js
megacitiesLayer.addTo(map);
```

#### When to use SQL?
You have a CARTO account, with several custom datasets, and you want to visualize them in a layer, applying some kind of transformation to the source, from a filter to more advanced analysis.

---

### All together

Congrats! You have finished this guide. The final map should look like this:
<div class="example-map">
    <iframe
        id="guides-sources-step-3"
        src="/developers/carto-vl/examples/maps/guides/add-data-sources/step-3.html"
        width="100%"
        height="500"
        style="margin: 20px auto !important"
        frameBorder="0">
    </iframe>
</div>
> You can explore the final step [here](/developers/carto-vl/examples/maps/guides/add-data-sources/step-3.html)


This is the complete code:
```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">

    <script src="https://libs.cartocdn.com/carto-vl/%VERSION%/carto-vl.js"></script>
    <script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.50.0/mapbox-gl.js'></script>
    <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.50.0/mapbox-gl.css' rel='stylesheet' />

    <link rel="stylesheet" type="text/css" href="../../style.css">
</head>

<body>
    <!-- Add map container -->
    <div id="map"></div>

    <script>
        // Add basemap and set properties
        const map = new mapboxgl.Map({
            container: 'map',
            style: carto.basemaps.voyager,
            center: [0, 30],
            zoom: 2
        });

        // Add zoom controls
        const nav = new mapboxgl.NavigationControl();
        map.addControl(nav, 'top-left');


        //** CARTO VL functionality begins here **//


        // DATASET
        // Define Dataset source with custom credentials
        const citiesSource = new carto.source.Dataset('populated_places', {
            username: 'cartovl',
            apiKey: 'default_public'
        });

        // Define Viz object with custom style
        const citiesViz = new carto.Viz(`
            color: grey
            width: 4
        `);

        // Define map Layer
        const citiesLayer = new carto.Layer('cities', citiesSource, citiesViz);

        // Add map Layer
        citiesLayer.addTo(map);


        // GEOJSON
        // Create GeoJSON content
        const offices = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-73.944158, 40.678178]
                    },
                    "properties": {
                        "address": "Brooklyn, New York"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-3.70379, 40.416775]
                    },
                    "properties": {
                        "address": "Madrid, Spain"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-0.127758, 51.507351]
                    },
                    "properties": {
                        "address": "London, United Kingdom"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-77.036871, 38.907192]
                    },
                    "properties": {
                        "address": "Washington, DC"
                    }
                }
            ]
        };

        // Define GeoJSON source
        const officesSource = new carto.source.GeoJSON(offices);

        // Define Viz object with custom style
        const officesViz = new carto.Viz(`
            color: red
            width: 20
        `);

        // Define map Layer
        const officesLayer = new carto.Layer('offices', officesSource, officesViz);

        // Add map Layer
        officesLayer.addTo(map);


        // SQL
        // Define query
        const query = 'SELECT * FROM populated_places WHERE megacity = 1';

        // Define SQL source with query and custom credentials
        const megacitiesSource = new carto.source.SQL(query, {
            username: 'cartovl',
            apiKey: 'default_public'
        });

        // Define Viz object with custom style
        const megacitiesViz = new carto.Viz('color: blue');

        // Define map Layer
        const megacitiesLayer = new carto.Layer('megacities', megacitiesSource, megacitiesViz);

        // Add map Layer
        megacitiesLayer.addTo(map);
    </script>
</body>

</html>
```
