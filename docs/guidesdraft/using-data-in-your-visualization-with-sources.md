## Getting data using Sources
In this guide you will learn how to use different data sources for your CARTO VL visualizations. After practicing with it, you will be able to connect to your datasets in several ways, and you will know which is the better option for you.

This guide assumes that you have previously gone through the [Getting Started guide](https://carto.com/developers/carto-vl/guides/getting-started), so you already know how to make a simple map.


### How to get data
CARTO VL is a library that visualizes geographical datasets in a powerful and flexible way. Those datasets can be yours or they can be served by some other provider, but the first step to know where they are hosted and how they can be accessed.

Our library currently supports these three options:
* **Dataset**: a vector dataset hosted by CARTO and available with your credentials (for example, a dataset with all the *stores in your city*).
* **GeoJSON**: a vector dataset in GeoJSON format.
* **SQL**: a Dataset with a SQL query applied to it (e.g. just the *stores with > 500 sq meters*).

Every option is a different kind of **Source**, and CARTO VL provides you with a suitable object in its API to connect to them under the namespace `carto.source`, for example `carto.source.Dataset`.

Both *Dataset* and *SQL* are based in *Vector Tiles*. This is an advanced technology which allows transferring geographic data from the server to your client in small chunks, allowing a good performance and a dynamic styling.
> In fact, there is an internal fourth type of source, called [MVT](https://carto.com/developers/carto-vl/reference/#cartosourcemvt)but it is not meant to be used directly by the users.


Next you will see how to use the main three ones, but first let's create a basic map.

You can start from this [basemap](https://carto.com/developers/carto-vl/examples/getting-started/basemap). Go ahead and clone its source code into a new file called `sources.html`, we will wait for you...


### Dataset
A `Dataset` can be managed using [carto.source.Dataset](https://carto.com/developers/carto-vl/reference/#cartosourcedataset). It is a source with information regarding to an specific topic (such as *stores*, *streets* or *counties*). If you have a GIS background, this is like a vector file with points, lines or polygons, but hosted at CARTO. If you don't, you can imagine it as a simple table at the server, with a geometry field you can map.

#### Add a Dataset
You already know how to add a `Dataset` thanks to *Getting Started* guide:
```js
const aSource = new carto.source.Dataset('name_of_your_dataset');
```
That was using `carto.setDefaultAuth` method, but now you will see how to include custom credentials for an specific dataset. Add this to your current working file (*sources.html* if you followed our suggestion), just after map creation.
```js
const cities = new carto.source.Dataset('ne_10m_populated_places_simple', {
    user: 'cartovl',
    apiKey: 'default_public'
});
```

As with any source, you should then pass it to a `Layer` and add that one to the map to visualize it. So include this code:
```js
const citiesLayer = new carto.Layer('cities', citiesSource, new carto.Viz('color:grey width:4'));
citiesLayer.addTo(map);
```
> Notice how you can add a simple viz to inline the style.


The result should look like this:
<div class="example-map">
    <iframe
        id="guides-sources-step-1"
        src="https://carto.com/developers/carto-vl/examples/maps/guides/sources/step-1.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

#### When to use a Dataset?
You have a CARTO account, with several custom datasets, and you want to easily visualize one of them in a map, with all its rows.


### GeoJSON
A `GeoJSON` can be used in CARTO VL with [carto.source.GeoJSON](https://carto.com/developers/carto-vl/reference/#cartosourcegeojson).

GeoJSON is an standard format to encode geographic data using JavaScript. It is indeed a common JSON, extended with spatial features. You can easily create some *.geojson* contents online at [geojson.io](http://geojson.io/).

With the next steps, you'll create a new layer with this format, in this case visualizing the main *CARTO offices*.

#### Add GeoJSON
You can include GeoJSON contents embedded directly in your JavaScript, like this:
```js
const geojson = {
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
> If your dataset is much bigger, you'd probably store that content in an external file (see more Advanced examples)

And then use it within a GeoJSON source, like this:
```js
const geojsonSource = new carto.source.GeoJSON(geojson);
```

Create a style for the layer:
```js
const viz = new carto.Viz(`
    color: red
    width: 20
`);
```

And finally create and add a layer to the map:
```js
const geojsonLayer = new carto.Layer('offices', geojsonSource, viz);
geojsonLayer.addTo(map);
```

Now the map should look like this:
<div class="example-map">
    <iframe
        id="guides-sources-source-geojson"
        src="https://carto.com/developers/carto-vl/examples/maps/guides/sources/step-2.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

#### When to use a GeoJSON?
You already have your data in that format, and you currently don't have access to a CARTO account (if you have, you should import it to get a better performance and more capabilities, and then use another type of `Source`). It can also be a useful format for some quick tests, using inline GeoJSON if you are managing just a few rows or a *.geojson* file just next to your *.html*.


### SQL
SQL is a very common language to make queries in databases and geospatial software. It provides a flexible mechanism to adapt your dataset to your specific needs. Let's use it now in your map!

Define a query, to select just the biggest cities in the world
```js
const query = 'SELECT * FROM ne_10m_populated_places_simple WHERE megacity = 1';
```
> This is a very simple query but the SQL runs on CARTO's backend (which is powered by PostGIS). So you could also execute sophisticated queries and spatial analysis.

Create a SQL source. Don't forget to add your credentials:
```js
const sqlSource = new carto.source.SQL(query, {
    user: 'cartovl',
    apiKey: 'default_public'
});
```

Create a common layer with those selected cities and add it to the map
```js
const sqlLayer = new carto.Layer('megacities', sqlSource, new carto.Viz(`color: blue`));
sqlLayer.addTo(map);
```

#### When to use SQL?
You have a CARTO account, with several custom datasets, and you want to visualize them in a layer, applying some kind of transformation to the source, from a simple filter to more advanced analysis.

---

### All together

Congrats!, the final map should look like this:
<div class="example-map">
    <iframe
        id="guides-sources-source-sql"
        src="https://carto.com/developers/carto-vl/examples/maps/guides/sources/source-3-sql.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>


And this is the complete code:
```html
<!DOCTYPE html>
<html>

<head>
    <!-- Include CARTO VL JS -->
    <script src="../../../../dist/carto-vl.js"></script>
    <!-- Include Mapbox GL JS -->
    <script src="https://libs.cartocdn.com/mapbox-gl/v0.48.0-carto1/mapbox-gl.js"></script>
    <!-- Include Mapbox GL CSS -->
    <link href="https://libs.cartocdn.com/mapbox-gl/v0.48.0-carto1/mapbox-gl.css" rel="stylesheet" />
    <!-- Make the map visible -->
    <style>
        #map {
            position: absolute;
            height: 100%;
            width: 100%;
        }
    </style>
</head>

<body>
    <!-- Map goes here -->
    <div id="map"></div>
    <script>
        // BASEMAP
        const map = new mapboxgl.Map({
            container: 'map',
            style: carto.basemaps.voyager,
            center: [0, 30],
            zoom: 2,
            dragRotate: false,
        });
        map.touchZoomRotate.disableRotation();
        const nav = new mapboxgl.NavigationControl({
            showCompass: false
        });
        map.addControl(nav, 'top-left');

        // DATASET
        // Add a Dataset
        const citiesSource = new carto.source.Dataset('ne_10m_populated_places_simple', {
            user: 'cartovl',
            apiKey: 'default_public'
        });
        // Create a layer with default style and add it to the map
        const citiesLayer = new carto.Layer('cities', citiesSource, new carto.Viz('color:grey width:4'));
        citiesLayer.addTo(map);

        // GEOJSON
        // Add GeoJSON
        const geojson = {
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
        // Create a GeoJSON source
        const geojsonSource = new carto.source.GeoJSON(geojson);
        // Create a style for the geojson layer
        const viz = new carto.Viz(`
            color: red
            width: 20
        `);
        // Create and add a layer with the geojson
        const geojsonLayer = new carto.Layer('offices', geojsonSource, viz);
        geojsonLayer.addTo(map);

        // SQL
        // Define a query
        const query = 'SELECT * FROM ne_10m_populated_places_simple WHERE megacity = 1';
        // Create a SQL source
        const sqlSource = new carto.source.SQL(query, {
            user: 'cartovl',
            apiKey: 'default_public'
        });
        // Create a layer with those selected cities
        const sqlLayer = new carto.Layer('megacities', sqlSource, new carto.Viz(`color: blue`));
        sqlLayer.addTo(map);
    </script>
</body>

</html>

```
`
