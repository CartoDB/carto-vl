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
            SELECT name, value
            FROM \`${dataset}.metadata\`
            WHERE table_name = '${tileset}'`;

        const result = await this._execute(sqlQuery);

        const metadata = {};

        if (result && result.rows) {
            for (let i = 0; i < result.rows.length; i++) {
                const row = result.rows[i];
                if (row.f && row.f.length === 2) {
                    metadata[row.f[0].v] = row.f[1].v;
                }
            }
        }

        return metadata;
    }

    async fetchTiles (tiles, dataset, tileset, tilesetMetadata) {
        if (!_partitioner) {
            const params = JSON.parse(tilesetMetadata.carto_quadkey_zoom);
            _partitioner = initializePartitioner(params);
        }

        const parentQuadkeys = getParentQuadkeysFromTiles(tiles);
        const parentQuadkeysFilter = parentQuadkeys.length ? `carto_quadkey IN (${parentQuadkeys})` : 'TRUE';
        const tilesFilter = tiles.map((tile) => tileFilter(tile)).join(' OR ');
        const sqlQuery = `
            SELECT zoom_level, tile_column, tile_row, tile_data
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
        zmax: parameters.zmax
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
    return `(zoom_level = ${tile.z} AND tile_column = ${tile.x} AND tile_row = ${tile.y})`;
}
