## Add Data Sources
In this guide you will learn how to use different data sources in your CARTO VL layers. After finishing this guide, you will be able to use different type of sources, and know which type is best for you.

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

### Supported Data Sources
CARTO VL is a library that visualizes geographical datasets in a powerful and flexible way. Those datasets can be yours or they can be served by some other provider, but the first step to know is where they are hosted and how they can be accessed.

CARTO VL currently supports three basic types of data sources:
* **Dataset**: a vector [dataset](https://carto.com/help/glossary/#dataset) hosted by CARTO and available with your credentials (for example, a dataset with all the *stores in your city*).
* **SQL**: a dataset with a [SQL query](https://carto.com/help/glossary/#query) applied to it (e.g. just the *stores with > 500 sq meters*).
* **GeoJSON**: a vector dataset in [GeoJSON](https://carto.com/help/glossary/#geojson) format.

Every type is a different kind of **Source**, and CARTO VL provides you with a suitable object in its API to use them under the namespace `carto.source` (for example `carto.source.Dataset`).

Both *Dataset* and *SQL* are based in [Vector Tiles](https://carto.com/help/glossary/#vectortile), following the *Mapbox Vector Tile Specification* or [MVT](https://www.mapbox.com/vector-tiles/specification/). This advanced technology allows transferring geographic data from the server to your browser in small chunks, allowing good performance through progressive loading of data.

**Note:**
In fact, there is a fourth type of source in CARTO VL called [carto.source.MVT](/developers/carto-vl/reference/#cartosourcemvt) but its usage is only recommended for some advanced cases.

### Getting started
In the following section you will see how to use the three main source types. Before getting started with that, you will need to create a basic map.

You can start from this [basemap](/developers/carto-vl/examples/maps/guides/getting-started/step-1.html). Go ahead and copy its source code into a new file called `sources.html`.

**Note:**
To copy the source code from an example, you just have to navigate to it with your browser, click right button > `View source` and copy the whole text, from `<html>` to `</html>` tags.

### Dataset source
A `Dataset` source can be created with the [carto.source.Dataset](/developers/carto-vl/reference/#cartosourcedataset) constructor. If you have a GIS background, this is like a local vector file with points, lines or polygons, hosted in CARTO. If you don't, you can think of it as a table on the server with a geometry field you can use to draw it on a map.

#### Add a Dataset source
You already know how to add a `Dataset` thanks to the *Getting Started* guide:
```js
const aSource = new carto.source.Dataset('name_of_your_dataset');
```
That was using `carto.setDefaultAuth` method, but now you will see how to include custom credentials for a specific dataset. This allows to work with multiple Sources with different combinations of usernames and API keys. Add this to your current working file (*sources.html* if you followed our suggestion), just after map creation.
```js
const citiesSource = new carto.source.Dataset('populated_places', {
    username: 'cartovl',
    apiKey: 'default_public'
});
```

Now you're ready for the layer creation:
```js
const citiesLayer = new carto.Layer('cities', citiesSource, new carto.Viz());
```
The first parameter, in this case, `'cities'`, is the Mapbox GL ID for the layer, you should avoid name clashing with your basemap layer IDs.

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
> View this step [here](/developers/carto-vl/examples/maps/guides/add-data-sources/step-1.html)


#### When to use a Dataset source?
You have a CARTO account, with several custom datasets, and you want to visualize one of them on a map, with all its rows.

### GeoJSON source
A `GeoJSON` can be used in CARTO VL with [carto.source.GeoJSON](/developers/carto-vl/reference/#cartosourcegeojson). GeoJSON is a standard format to encode geographic data using JSON. You can create some *.geojson* contents online at [geojson.io](http://geojson.io/).

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
                "coordinates": [-77.036871, 38.907192]
            },
            "properties": {
                "address": "Washington, DC"
            }
        }
    ]
};
```

**Note:**
If your dataset is much bigger, you would probably store that content in an external file (see this [External GeoJSON layer](/developers/carto-vl/examples/#example-external-geojson-layer) example).

And then use it within a GeoJSON source, like this:
```js
const officesSource = new carto.source.GeoJSON(offices);
```

Define a map layer:
```js
const officesLayer = new carto.Layer('offices', officesSource, new carto.Viz());
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
> View this step [here](/developers/carto-vl/examples/maps/guides/add-data-sources/step-2.html)


#### When to use a GeoJSON source?
You already have your data in GeoJSON format, and you don't have access to a CARTO account (if you do have a CARTO account, you should import it to get a better performance and more capabilities, and then use a `Dataset` source). This can also be a useful format for some quick tests, using inline GeoJSON if you are managing just a few rows or a *.geojson* file just next to your *.html*.

### SQL source
SQL is a very common language to make queries in databases and geospatial software. It provides a flexible mechanism to adapt your dataset to your specific needs.

#### Add a SQL source
Let's see how to add a SQL source to your map!

Define a query (select only the largest cities in the world: with `megacity` category) from the `populated_places` dataset:
```js
const query = 'SELECT * FROM populated_places WHERE megacity = 1';
```
**Note:**
This is a simple query but the SQL runs on CARTO's backend, which is powered by PostGIS, so you could also execute more sophisticated queries and even spatial analysis.

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
Using your CARTO account, you want to visualize a custom query in a layer: apply some transformations to your dataset,
filter using PostGIS functionality, or to join a couple of datasets.

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
    <script src="https://libs.cartocdn.com/carto-vl/%VERSION%/carto-vl.min.js"></script>
    <script src="https://api.tiles.mapbox.com/mapbox-gl-js/v0.52.0/mapbox-gl.js"></script>
    <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.52.0/mapbox-gl.css" rel="stylesheet" />
    <link rel="stylesheet" type="text/css" href="../../style.css">
</head>
<body>
    <div id="map"></div>
    <script>
        const map = new mapboxgl.Map({
            container: 'map',
            style: carto.basemaps.voyager,
            center: [0, 30],
            zoom: 2
        });
        const nav = new mapboxgl.NavigationControl();
        map.addControl(nav, 'top-left');

        //** CARTO VL functionality begins here **//

        // DATASET
        // Define Dataset source with custom credentials
        const citiesSource = new carto.source.Dataset('populated_places', {
            username: 'cartovl',
            apiKey: 'default_public'
        });
        const citiesViz = new carto.Viz(`
            color: grey
            width: 4
        `);
        const citiesLayer = new carto.Layer('cities', citiesSource, citiesViz);
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
        const officesViz = new carto.Viz(`
            color: red
            width: 20
        `);
        const officesLayer = new carto.Layer('offices', officesSource, officesViz);
        officesLayer.addTo(map);

        // SQL
        // Define query
        const query = 'SELECT * FROM populated_places WHERE megacity = 1';
        // Define SQL source with query and custom credentials
        const megacitiesSource = new carto.source.SQL(query, {
            username: 'cartovl',
            apiKey: 'default_public'
        });
        const megacitiesViz = new carto.Viz('color: blue');
        const megacitiesLayer = new carto.Layer('megacities', megacitiesSource, megacitiesViz);
        megacitiesLayer.addTo(map);
    </script>
</body>
</html>
```
