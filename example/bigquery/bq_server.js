const http = require('http')
const port = 3000
const n_points = 20000;

const projectId = 'cdb-gcp-europe';

function syncQuery(sqlQuery) {
    const BigQuery = require('@google-cloud/bigquery');

    const bigquery = new BigQuery({
      projectId: projectId,
    });

    const options = {
      query: sqlQuery,
      timeoutMs: 10000, // Time out after 10 seconds.
      useLegacySql: false, // Use standard SQL syntax for queries.
    };

    return bigquery.query(options)
}

// tile 13/2412/3078 approximated as a long/lat rectangle
const min_x = -74.00390625, min_y = 40.7472569628042, max_x = -73.9599609375, max_y = 40.7805414318603;
const res_x = 0.000171661376953125, res_y = 0.0001300174572503865;
// table to query
const table = '`nyc-tlc.yellow.trips`';
const x_column = 'pickup_longitude';
const y_column = 'pickup_latitude';
const aggregate_columns = {
    total_amount: 'AVG(total_amount)',
    trip_distance: 'AVG(trip_distance)',
    feature_count: 'COUNT(*)'
};

function metadataQuery() {
    return `
        SELECT COUNT(*) AS feature_count FROM ${table}
        WHERE
        ${x_column} BETWEEN ${min_x} AND ${max_x} AND
        ${y_column} BETWEEN ${min_y} AND ${max_y};
   `
}

function dataQuery(res_factor = 1) {
    const agg_col_names = Object.keys(aggregate_columns).join(',')
    const agg_cols = Object.keys(aggregate_columns).map(col => `${aggregate_columns[col]} AS ${col}`).join(',')
    const dx = res_x * res_factor;
    const dy = res_y * res_factor;
    return `
        WITH
        _cdb_clusters AS (
        SELECT
            Floor(${x_column}/${dx}) AS _cdb_gx,
            Floor(${y_column}/${dy}) AS _cdb_gy,
            ${agg_cols}
        FROM ${table}
        WHERE
            ${x_column} BETWEEN ${min_x} AND ${max_x} AND
            ${y_column} BETWEEN ${min_y} AND ${max_y}
        GROUP BY _cdb_gx, _cdb_gy
        )
        SELECT
        (_cdb_gx + 0.5)*${dx} AS ${x_column},
        (_cdb_gy + 0.5)*${dy} AS ${y_column},
        ${agg_col_names}
        FROM _cdb_clusters;
   `
}

function randomPoint(min_x, min_y, max_x, max_y) {
    return {
        pickup_longitude: Math.random()*(max_x - min_x) + min_x,
        pickup_latitude: Math.random()*(max_y - min_y) + min_y,
        total_amount: Math.random()*150,
        trip_distance: Math.random()*100,
        feature_count: Math.random()*5500
    }
}

const requestHandler = (request, response) => {
    console.log(request.url)
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    response.setHeader("Access-Control-Allow-Credentials", false);
    response.setHeader("Access-Control-Max-Age", '86400'); // 24 hours
    response.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
    if (request.method === 'OPTIONS') {
        response.end();
    }
    else if (request.url.match(/metadata/i)) {
        syncQuery(metadataQuery()).then(results => {
            const rows = results[0];
            const metadata = {
                featureCount: rows[0].feature_count,
                columns: Object.keys(aggregate_columns).map(col => ({
                   name: col,
                   type: 'float'
                })),
                categoryIDs: {}
            };
            response.end(JSON.stringify(metadata));
          })
          .catch(err => {
            console.error('ERROR:', err);
          });
    }
    else if (request.url.match(/preview/i)) {
        const n_points = 20000;
        data = Array.apply(null, Array(n_points*2)).map(()=>randomPoint(min_x, min_y, max_x, max_y));
        response.end(JSON.stringify(data));
    }
    else {
        syncQuery(dataQuery()).then(results => {
            response.end(JSON.stringify(results[0]));
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
    }
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('ERROR', err)
  }
  console.log(`server is listening on ${port}`)
})
