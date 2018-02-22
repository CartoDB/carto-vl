'use strict';

function syncQuery(sqlQuery, projectId) {
  const BigQuery = require('@google-cloud/bigquery');

  const bigquery = new BigQuery({
    projectId: projectId,
  });

  const options = {
    query: sqlQuery,
    timeoutMs: 10000, // Time out after 10 seconds.
    useLegacySql: false, // Use standard SQL syntax for queries.
  };

  bigquery
    .query(options)
    .then(results => {
      const rows = results[0];
      console.log('Rows:');
      rows.forEach(row => console.log(row));
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}

function asyncQuery(sqlQuery, projectId) {
  const BigQuery = require('@google-cloud/bigquery');

  const bigquery = new BigQuery({
    projectId: projectId,
  });

  const options = {
    query: sqlQuery,
    useLegacySql: false, // Use standard SQL syntax for queries.
  };

  let job;

  bigquery
    .createQueryJob(options)
    .then(results => {
      job = results[0];
      console.log(`Job ${job.id} started.`);
      return job.promise();
    })
    .then(() => {
      // Get the job's status
      return job.getMetadata();
    })
    .then(metadata => {
      // Check the job's status for errors
      const errors = metadata[0].status.errors;
      if (errors && errors.length > 0) {
        throw errors;
      }
    })
    .then(() => {
      console.log(`Job ${job.id} completed.`);
      return job.getQueryResults();
    })
    .then(results => {
      const rows = results[0];
      console.log('Rows:');
      rows.forEach(row => console.log(row));
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END bigquery_async_query]
}

require(`yargs`)
  .demand(1)
  .command(
    `sync <projectId> <sqlQuery>`,
    `Run the specified synchronous query.`,
    {},
    opts => syncQuery(opts.sqlQuery, opts.projectId)
  )
  .command(
    `async <projectId> <sqlQuery>`,
    `Start the specified asynchronous query.`,
    {},
    opts => asyncQuery(opts.sqlQuery, opts.projectId)
  )
  .example(
    `node $0 sync "cdb-gcp-europe" "SELECT * FROM \`nyc-tlc.yellow.trips\` LIMIT 10;"`,
    `Synchronously queries the taxis dataset.`
  )
  .example(
    `node $0 async "cdb-gcp-europe" "SELECT * FROM \`nyc-tlc.yellow.trips\` LIMIT 10;"`,
    `Queries the taxis dataset as a job.`
  )
  .wrap(120)
  .recommendCommands()
  .help()
  .strict().argv;
