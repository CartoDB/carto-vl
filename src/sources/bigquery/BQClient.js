
import gapi from './gapi';
import { decode } from 'base64-arraybuffer';

const MOCK = false;
const MVT_MOCK = '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';

export default class BQClient {
    constructor (bqSource) {
        this._projectId = bqSource.projectId;
        this._datasetId = bqSource.datasetId;
        this._tableId = bqSource.tableId;
        this._token = bqSource.token;
    }

    init () {
        return new Promise((resolve, reject) => {
            gapi.load('client', () => {
                gapi.auth.setToken({ access_token: this._token });
                gapi.client.load('bigquery', 'v2', () => {
                    resolve();
                });
            });
        });
    }

    async fetchTiles (tiles) {
        let z = 0;
        if (tiles && tiles.length) {
            z = tiles[0].z;
        }
        if (z === 14) {
            // console.log('Fetch BigQuery tiles', tiles);

            if (MOCK) {
                return tiles.map(({ x, y, z }) => ({ x, y, z, buffer: decode(MVT_MOCK) }));
            }

            const tilesFilter = tiles.map((tile) => this._tileFilter(tile)).join(' OR ');

            const projectId = this._projectId;
            const query = `SELECT x, y, z, mvt
                FROM \`${this._datasetId}.${this._tableId}\`
                WHERE ${tilesFilter}`;
            const useLegacySql = false;
            const useQueryCache = true;

            const response = await gapi.client.bigquery.jobs.query({
                projectId,
                query,
                useLegacySql,
                useQueryCache
            });

            const mvts = [];

            if (response.result && response.result.rows) {
                for (let i = 0; i < response.result.rows.length; i++) {
                    const row = response.result.rows[i];
                    if (row.f && row.f.length === 4) {
                        const x = parseInt(row.f[0]['v']);
                        const y = parseInt(row.f[1]['v']);
                        const z = parseInt(row.f[2]['v']);
                        const mvt = row.f[3]['v'];
                        mvts.push({ x, y, z, buffer: decode(mvt) });
                    }
                }
            }

            return mvts;
        }
    }

    _tileFilter (tile) {
        return `(z = ${tile.z} AND x = ${tile.x} AND y = ${tile.y})`;
    }
}
