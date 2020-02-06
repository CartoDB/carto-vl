
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

    async fetchRawTiles () {
        if (requests > 0) {
            return [];
        }
        requests = 1;

        console.log('Fetch Raw Tile');

        const result = await this.execute(`
            SELECT x,y,ARRAY_AGG(STRUCT(geom_table)) as geoms 
            FROM \`carto-do-public-data.usa_carto.geography_usa_blockgroup_2015\` as geom_table, 
            unnest(\`cartodb-gcp-backend-data-team\`.tiler.getTilesBBOX(-73.955397,40.724201,-73.924341,40.743828, 14, 256))
            WHERE ST_INTERSECTSBOX(geom, bbox[OFFSET(0)], bbox[OFFSET(1)], bbox[OFFSET(2)], bbox[OFFSET(3)])
                  AND ST_INTERSECTSBOX(geom, -73.955397, 40.724201, -73.924341, 40.743828)
            GROUP by x,y
            LIMIT 1;
        `);

        const z = 14;
        const { x, y, geojson } = bq2geojson(result);

        const tileindex = geojsonVt(geojson, { tolerance: 0 });

        const tile = tileindex.getTile(z, x, y);

        const mvtBuffer = fromGeojsonVt({ 'default': tile }, { version: 2 });

        return [{ z, x, y, buffer: mvtBuffer }];
    }
}

function bq2geojson (result) {
    const row = result.rows[0];

    const x = parseInt(row.f[0].v);
    const y = parseInt(row.f[1].v);
    const geoms = row.f[2].v;

    const geojson = {
        type: 'FeatureCollection',
        features: []
    };

    for (let i = 0; i < geoms.length; i++) {
        const geoid = geoms[i].v.f[0].v.f[0].v;
        // const label = geoms[i].v.f[0].v.f[1].v;
        // const area = geoms[i].v.f[0].v.f[2].v;
        // const perimeter = geoms[i].v.f[0].v.f[3].v;
        // const num_vertices = geoms[i].v.f[0].v.f[4].v;
        const geom = geoms[i].v.f[0].v.f[5].v;
        const geometry = parse(geom);
        geojson.features.push({
            type: 'Feature',
            geometry,
            properties: {
                geoid
                // label,
                // area,
                // perimeter,
                // num_vertices
            }
        });
    }

    return { x, y, geojson };
}
