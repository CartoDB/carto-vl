import BigQueryClient from './BQClient';
import { decode } from 'base64-arraybuffer';
import { inflate } from 'pako';

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
        const quadKeyZoom = parseInt(tilesetMetadata.carto_quadkey_zoom);
        const parentQuadkeys = getParentIntegerQuadkeysFromTiles(tiles, quadKeyZoom);
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

function getParentIntegerQuadkeysFromTiles (tiles, zOutput) {
    if (zOutput === 0) {
        return [];
    }

    let result = new Set();
    for (let tile of tiles) {
        result.add(getParentIntegerQuadkeyFromTile(tile, zOutput));
    }

    return [...result].filter(x => x !== null);
}

function getParentIntegerQuadkeyFromTile (tile, zOutput) {
    if (tile.z === 0) {
        return null;
    }

    zOutput = (zOutput === undefined || zOutput === null || zOutput < 0) ? tile.z : zOutput;

    let index = getQuadkeyFromTile(tile);

    if (index.length >= zOutput) {
        index = index.substring(0, zOutput);
    } else {
        index += '0'.repeat(zOutput - index.length);
    }

    return parseInt(index, 4);
}

function getQuadkeyFromTile (tile) {
    let index = '';

    for (let z0 = tile.z; z0 > 0; z0--) {
        let b = 0;
        let mask = 1 << (z0 - 1);
        if ((tile.x & mask) !== 0) b++;
        if ((tile.y & mask) !== 0) b += 2;
        index += b.toString();
    }

    return index;
}

function tileFilter (tile) {
    return `(zoom_level = ${tile.z} AND tile_column = ${tile.x} AND tile_row = ${tile.y})`;
}
