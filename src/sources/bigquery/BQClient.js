
import { parse } from 'wellknown';
import { decode } from 'base64-arraybuffer';
import { fromGeojsonVt } from 'vt-pbf';
import geojsonVt from 'geojson-vt';

const ENDPOINT_URL = 'https://bigquery.googleapis.com/bigquery/v2';

let requests = 0;

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
        if (requests > 0) {
            return [];
        }
        requests = 1;

        console.log(tiles)

        console.log('Fetch Raw Tiles');

        const time1 = getTime();

        const z = 14;
        const x = tiles.map((tile) => tile.x);
        const y = tiles.map((tile) => tile.y);
        const extent = 4096;

        const query = `
            WITH tiles_bbox AS (
                SELECT * FROM UNNEST(tiler.getTilesBounds(${z}, [${x}], [${y}], ${extent}))
            )

            SELECT b.z, b.x, b.y, tiler.mvt(b.z, b.x, b.y, array_agg(TO_JSON_STRING(a)), 'geom') as mvt
            FROM \`rmr_tests.geography_usa_block_2019_bbox_double\` a, tiles_bbox AS b
            WHERE NOT ((a.xmin > b.xmax) OR (a.xmax < b.xmin)  OR (a.ymax < b.ymin) OR (a.ymin > b.ymax))
            GROUP BY b.z, b.x, b.y
        `;

        const result = await this.execute(query);

        const time2 = getTime();
        console.log(time2 - time1);

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

        // const z = 14;

        // for (let i = 0; i < result.rows.length; i++) {
        //     const { x, y, geojson } = bq2geojson(result.rows[i]);

        //     const tileindex = geojsonVt(geojson, { tolerance: 0 });

        //     const tile = tileindex.getTile(z, x, y);

        //     const mvtBuffer = fromGeojsonVt({ 'default': tile }, { version: 2 });

        //     mvts.push({ z, x, y, buffer: mvtBuffer });
        // }

        return mvts;
    }
}

function bq2geojson (row) {
    const x = parseInt(row.f[0].v);
    const y = parseInt(row.f[1].v);
    const geoms = row.f[2].v;

    const geojson = {
        type: 'FeatureCollection',
        features: []
    };

    for (let i = 0; i < geoms.length; i++) {
        const geoid = geoms[i].v.f[0].v.f[0].v;
        const label = geoms[i].v.f[0].v.f[1].v;
        const area = geoms[i].v.f[0].v.f[2].v;
        // const perimeter = geoms[i].v.f[0].v.f[3].v;
        // const num_vertices = geoms[i].v.f[0].v.f[4].v;
        const geom = geoms[i].v.f[0].v.f[5].v;
        const geometry = parse(geom);
        geojson.features.push({
            type: 'Feature',
            geometry,
            properties: {
                geoid,
                label,
                area
                // perimeter,
                // num_vertices
            }
        });
    }

    return { x, y, geojson };
}

function getTime () {
    return (new Date()).getTime();
}
