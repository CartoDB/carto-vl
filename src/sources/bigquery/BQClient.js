
import { decode } from 'base64-arraybuffer';

const ENDPOINT_URL = 'https://bigquery.googleapis.com/bigquery/v2';

export default class BQClient {
    constructor (bqSource) {
        this._projectId = bqSource.projectId;
        this._datasetId = bqSource.datasetId;
        this._tableId = bqSource.tableId;
        this._token = bqSource.token;
    }

    async list () {
        return this.fetch('GET', 'jobs');
    }

    async insert () {
        return this.fetch('POST', 'jobs');
    }

    async get (jobId) {
        return this.fetch('GET', `jobs/${jobId}`);
    }

    async cancel (jobId) {
        return this.fetch('POST', `jobs/${jobId}/cancel`);
    }

    async query (sqlQuery) {
        return this.fetch('POST', 'queries', {
            kind: 'bigquery#queryRequest',
            query: sqlQuery,
            useLegacySql: false
        });
    }

    async getQueryResults (jobId) {
        return this.fetch('GET', `queries/${jobId}`);
    }

    async execute (sqlQuery) {
        const result = await this.query(sqlQuery);
        return this._pollingQuery(result);
    }

    async _pollingQuery (result) {
        return new Promise((resolve, reject) => {
            if (result.jobComplete) {
                resolve(result);
            } else {
                const jobId = result.jobReference.jobId;
                setTimeout(async () => {
                    const result = await this.getQueryResults(jobId);
                    console.log('timer', result);
                    if (result.jobComplete) {
                        resolve(result);
                    } else {
                        resolve(this._pollingQuery(result));
                    }
                }, 5000);
            }
        });
    }

    async fetch (method, url, body) {
        const response = await fetch(`${ENDPOINT_URL}/projects/${this._projectId}/${url}`, {
            method,
            headers: {
                'Authorization': `Bearer ${this._token}`,
                'Content-Type': 'application/json'
            },
            body: body && JSON.stringify(body)
        });
        return response.json();
    }

    async fetchTiles (tiles) {
        const tilesFilter = tiles.map((tile) => this._tileFilter(tile)).join(' OR ');
        const sqlQuery = `SELECT z,x,y,mvt FROM \`${this._datasetId}.${this._tableId}\` WHERE ${tilesFilter}`;

        const result = await this.query(sqlQuery);

        const mvts = [];
        if (result && result.rows) {
            for (let i = 0; i < result.rows.length; i++) {
                const row = result.rows[i];
                if (row.f && row.f.length === 4) {
                    const z = parseInt(row.f[0]['v']);
                    const x = parseInt(row.f[1]['v']);
                    const y = parseInt(row.f[2]['v']);
                    const mvt = row.f[3]['v'];
                    mvts.push({ z, x, y, buffer: decode(mvt) });
                }
            }
        }
        return mvts;
    }

    _tileFilter (tile) {
        return `(z = ${tile.z} AND x = ${tile.x} AND y = ${tile.y})`;
    }
}
