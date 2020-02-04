
import { decode } from 'base64-arraybuffer';

const ENDPOINT_URL = 'https://bigquery.googleapis.com/bigquery/v2';
// const ENDPOINT_URL = 'https://www.googleapis.com/bigquery/v2';

export default class BQClient {
    constructor (bqSource) {
        this._projectId = bqSource.projectId;
        this._datasetId = bqSource.datasetId;
        this._tableId = bqSource.tableId;
        this._token = bqSource.token;
    }

    async fetchTiles (tiles) {
        // console.log('Fetch BigQuery tiles', tiles);

        const tilesFilter = tiles.map((tile) => this._tileFilter(tile)).join(' OR ');
        const sqlQuery = `SELECT z,x,y,mvt FROM \`${this._datasetId}.${this._tableId}\` WHERE ${tilesFilter}`;

        const rows = await this.query(sqlQuery);

        const mvts = [];
        if (rows) {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
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

    async query (sqlQuery) {
        const response = await fetch(`${ENDPOINT_URL}/projects/${this._projectId}/queries`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this._token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                kind: 'bigquery#queryRequest',
                query: sqlQuery,
                useLegacySql: false
            })
        });
        const result = await response.json();
        return result && result.rows;
    }

    _tileFilter (tile) {
        return `(z = ${tile.z} AND x = ${tile.x} AND y = ${tile.y})`;
    }
}
