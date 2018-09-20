## Getting data using Sources
In this guide you will learn how to use different data sources for your CARTO VL visualizations. After practicing with it, you will be able to connect to your datasets in several ways, and you will know which is the better option for you.

This guide assumes that you have previously gone through the [Getting Started guide](https://carto.com/developers/carto-vl/guides/getting-started), so you already know how to make a simple map.


### How to get data
CARTO VL is a library that visualizes geographical datasets in a powerful and flexible way. Those datasets can be yours or they can be served by some other provider, but the first step is always to know where they are hosted and how they can be accessed.

Our library currently supports these three options:
* **Dataset**: a vector dataset hosted by CARTO and available with your credentials (for example, a dataset with all the *stores in your city*).
* **GeoJSON**: a vector dataset in GeoJSON format
* **SQL**: a Dataset with a SQL query applied to it (e.g. just the *stores with > 500 sq meters*).

Every option is a different kind of **Source**, and CARTO VL provides you with a suitable object in its API to connect to them under the namespace `carto.source`, for example `carto.source.Dataset`.

Next you will see how to use them, but first let's create a basic map.

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
const citiesLayer = new carto.Layer('cities', citiesSource, new carto.Viz());
citiesLayer.addTo(map);
```
> Notice how you have to add a viz object with `new carto.Viz()`.


The result should look like this map now:
<div class="example-map">
    <iframe
        id="guides-sources-source-dataset"
        src="https://carto.com/developers/carto-vl/examples/maps/guides/sources/source-1-dataset.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>

#### When to use a Dataset?
You have a CARTO account, with several custom datasets, and you want to easily visualize one of them in a map, with all its rows.


### GeoJSON
A `GeoJSON` can be used in CARTO VL with [carto.source.GeoJSON](https://carto.com/developers/carto-vl/reference/#cartosourcegeojson).

GeoJSON is an standard format to encode geographic data in the JavaScript ecosystem. It is indeed a common JSON, extended with spatial features. You can easily create some *.geojson* contents online at [geojson.io](http://geojson.io/).

With the next steps, you'll create a new layer with this format, in this case containing the main CARTO offices.

#### Add GeoJSON
You can include GeoJSON embedded directly in your JavaScript, like this:
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
> If your dataset is much bigger, you'd probably store that content in an external geojson file (see more Advanced examples)

And then use it within a GeoJSON source, like this:
```js
const geojsonSource = new carto.source.GeoJSON(geojson);
```

Create a style for the geojson layer:
```js
const viz = new carto.Viz(`
    color: red
    width: 20
`);
```

And finally create and add a layer:
```js
const geojsonLayer = new carto.Layer('offices', geojsonSource, viz);
geojsonLayer.addTo(map);
```

Now the map should look like this:
<div class="example-map">
    <iframe
        id="guides-sources-source-geojson"
        src="https://carto.com/developers/carto-vl/examples/maps/guides/sources/source-2-geojson.html"
        width="100%"
        height="500"
        frameBorder="0">
    </iframe>
</div>


#### When to use a GeoJSON?
You already have your data in that format, and you currently don't have access to a CARTO account (if you have, you should import it to get a better performance and more capabilities, and then use another type of `Source`). It can also be a useful format for some quick tests, using a *.geojson* file just next to your *.html*, or even inline GeoJSON if you are managing just a few rows.


<mark>
--- WIP...
</mark>

### SQL
SQL is a very common language to make queries in databases and geospatial software. It allows a flexible mechanism to query.


API SQL:
https://cartovl.carto.com/api/v2/sql?query such as
https://cartovl.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20ne_10m_populated_places_simple%20LIMIT%201

#### When to use SQL?
You have a CARTO account, with several custom datasets, and you want to visualize one or more of them combined in a layer, applying an specific transformation to the source, from a simple filter to more advance analysis.

---

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

### MVT
* Note on MVT
Extra for advanced users
