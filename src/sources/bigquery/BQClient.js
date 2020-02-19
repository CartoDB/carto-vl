
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
        if (result.error) {
            return result;
        }
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
                    const z = parseInt(row.f[0].v);
                    const x = parseInt(row.f[1].v);
                    const y = parseInt(row.f[2].v);
                    const mvt = row.f[3].v;
                    mvts.push({ z, x, y, buffer: decode(mvt) });
                }
            }
        }
        return mvts;
    }

    _tileFilter (tile) {
        return `(z = ${tile.z} AND x = ${tile.x} AND y = ${tile.y})`;
    }

    async fetchRawTiles (tiles) {
        console.log('Fetch Raw Tiles', tiles);

        const time1 = getTime();

        const x = tiles.map((tile) => tile.x);
        const y = tiles.map((tile) => tile.y);
        const z = tiles[0].z;
        const margin = 16 / 4096;

        const query = `
            WITH tiles_bbox AS (
                SELECT * FROM UNNEST(tiler.getTilesBounds(${z}, [${x}], [${y}], ${margin}))
            ),
            tiles_xyz AS (
                SELECT b.z, b.x, b.y, a.geoid
                FROM \`alasarr.geography_usa_block_2019_bbox_double_geojson\` a, tiles_bbox b
                WHERE NOT ((a.xmin > b.xmax) OR (a.xmax < b.xmin)  OR (a.ymax < b.ymin) OR (a.ymin > b.ymax))
            ),
            tiles_geom AS (
                SELECT b.z, b.x, b.y, a.geoid, a.geo_json as geom, a.do_area
                FROM \`alasarr.geography_usa_block_2019_bbox_double_geojson\` a, tiles_xyz b
                WHERE a.geoid = b.geoid
            )
            SELECT tiler.ST_ASMVT2(b.z, b.x, b.y, ARRAY_AGG(a), 0) AS tile
            FROM tiles_geom a, tiles_xyz b
            WHERE a.z = b.z AND a.x = b.x AND a.y = b.y AND a.geoid = b.geoid
            GROUP BY b.z, b.x, b.y
        `;

        const result = await this.execute(query);

        const time2 = getTime();
        console.log(time2 - time1);

        const mvts = [];

        // if (result && result.rows) {
        //     for (let i = 0; i < result.rows.length; i++) {
        //         const row = result.rows[i];
        //         if (row.f && row.f.length === 4) {
        //             const z = parseInt(row.f[0].v);
        //             const x = parseInt(row.f[1].v);
        //             const y = parseInt(row.f[2].v);
        //             const buffer = decode(row.f[3].v);
        //             mvts.push({ z, x, y, buffer });
        //         }
        //     }
        // }

        if (result && result.rows) {
            for (let i = 0; i < result.rows.length; i++) {
                const row = result.rows[i];
                if (row.f && row.f[0] && row.f[0].v && row.f[0].v[0] && row.f[0].v[0].v && row.f[0].v[0].v.f) {
                    const z = parseInt(row.f[0].v[0].v.f[0].v);
                    const x = parseInt(row.f[0].v[0].v.f[1].v);
                    const y = parseInt(row.f[0].v[0].v.f[2].v);
                    const buffer = decode(row.f[0].v[0].v.f[3].v);
                    mvts.push({ z, x, y, buffer });
                }
            }
        }

        return mvts;
    }
}

function getTime () {
    return (new Date()).getTime();
}
