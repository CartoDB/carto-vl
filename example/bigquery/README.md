Here, in order to do some quick tests using BigQuery,
it seemed simpler to use the existing node client;
but it cannot be used from the brower.
So an HTTP server is defined here (bq_server)
to handle communication with BigQuery and providing
the results to the browser. Since data is aggregated for
visualization the additional processing and tranference
is not a significant overhead.

Data used: `nyc-tlc.yellow.trips` table.
We're using a sample of this table imported into a CARTO account
as `trips_sample` and created with:
```
SELECT * FROM `nyc-tlc.yellow.trips` WHERE RAND() < 1000.0/1108779463.0
```


To run this test:

0. Point this env. var to BigQuery credentials :
```
export GOOGLE_APPLICATION_CREDENTIALS=".../BigQueryExecutor.json"
```

1. from the root of the renderer-prototype project
generate the front code with:
```
yarn build:watch
```

2. Run the HTTP server, from the example/bigquery subdirectory:
```
yarn serer
```

3. Open example/bigquery/bq.html in a brosser

