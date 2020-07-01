import BigQueryClient from './BQClient';
import GilbertPartition from './BQQuadkey';
import { decode } from 'base64-arraybuffer';
import { inflate } from 'pako';

// Singleton
let _partitioner = null;

export default class BigQueryTilesetClient {
    constructor (projectId, token) {
        this._client = new BigQueryClient(projectId, token);
    }

    async fetchMetadata (dataset, tileset) {
        const sqlQuery = `
            SELECT option_value FROM \`${dataset}.INFORMATION_SCHEMA.TABLE_OPTIONS\` 
            WHERE table_name='${tileset}' AND option_name = 'description'`;

        const result = await this._execute(sqlQuery);

        let metadata = {};

        if (result && result.rows && result.rows.length && result.rows[0] && result.rows[0].f &&
            result.rows[0].f.length && result.rows[0].f[0] && result.rows[0].f[0].v) {
            const rawMetadata = result.rows[0].f[0].v;
            metadata = JSON.parse(JSON.parse(rawMetadata));
        } else {
            throw Error('Tileset metadata not available');
        }

        return metadata;
    }

    async fetchTiles (tiles, dataset, tileset, tilesetMetadata) {
        if (!_partitioner) {
            const params = tilesetMetadata.carto_partition;
            _partitioner = initializePartitioner(params);
        }

        const parentQuadkeys = getParentQuadkeysFromTiles(tiles);
        const parentQuadkeysFilter = parentQuadkeys.length ? `carto_partition IN (${parentQuadkeys})` : 'TRUE';
        const tilesFilter = tiles.map((tile) => tileFilter(tile)).join(' OR ');
        const sqlQuery = `
            SELECT z, x, y, data
            FROM \`${dataset}.${tileset}\`
            WHERE (${parentQuadkeysFilter}) AND (${tilesFilter})`;

        const result = await this._execute(sqlQuery);

        let mvts = [];
        let missedTiles = Object.assign(tiles, {});
        if (result && result.rows) {
            for (let i = 0; i < result.rows.length; i++) {
                const row = result.rows[i];
                if (row.f && row.f.length === 4) {
                    const z = parseInt(row.f[0].v);
                    const x = parseInt(row.f[1].v);
                    const y = parseInt(row.f[2].v);
                    const mvt = tilesetMetadata.compression === 'gzip'
                        ? inflate(atob(row.f[3].v))
                        : decode(row.f[3].v);
                    mvts.push({ z, x, y, buffer: mvt });
                    missedTiles = missedTiles.filter((t) => !(t.z === z && t.x === x && t.y === y));
                }
            }

            console.log(`${mvts.length}/${result.totalRows}`);

            if (result.totalRows > mvts.length) {
                const missedmvts = await this.fetchTiles(missedTiles, dataset, tileset, tilesetMetadata);
                mvts = mvts.concat(missedmvts);
            }
        }

        return mvts;
    }

    async _execute (sqlQuery) {
        console.log('>');

        const begin = (new Date()).getTime();
        const result = await this._client.execute(sqlQuery);
        const end = (new Date()).getTime();

        console.log('<', end - begin);

        return result;
    }
}

function initializePartitioner (parameters) {
    if (parameters.version !== 1) {
        throw new Error('Unknown quadkey version');
    }
    const zRange = {
        zmin: parameters.zmin,
        zmax: parameters.zmax,
        zstep: parameters.zstep
    };
    const zmaxBBox = {
        xmin: parameters.xmin,
        xmax: parameters.xmax,
        ymin: parameters.ymin,
        ymax: parameters.ymax
    };
    const partitions = parameters.partitions;
    return new GilbertPartition(partitions, zRange, zmaxBBox);
}

function getParentQuadkeysFromTiles (tiles) {
    let result = new Set();
    for (let tile of tiles) {
        result.add(_partitioner.getPartition({ z: tile.z, x: tile.x, y: tile.y }));
    }
    return [...result].filter(x => x !== null);
}

function tileFilter (tile) {
    return `(z = ${tile.z} AND x = ${tile.x} AND y = ${tile.y})`;
}
