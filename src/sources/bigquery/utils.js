import { decode } from 'base64-arraybuffer';

export async function fetchTiles (client, tiles, tileset, quadKeyZoom) {
    // const quadkeys = tiles.map((tile) => `'${getQuadkeyFromTile(tile)}'`);
    // const quadkeys = tiles.map((tile) => getOnedIntegerQuadkeyFromTile(tile));
    // const quadkeysFilter = quadkeys.length ? `quadkey IN (${quadkeys})` : 'TRUE';
    const parentQuadkeys = getParentIntegerQuadkeysFromTiles(tiles, quadKeyZoom);
    const parentQuadkeysFilter = parentQuadkeys.length ? `parent_quadkey IN (${parentQuadkeys})` : 'TRUE';
    const tilesFilter = tiles.map((tile) => tileFilter(tile)).join(' OR ');
    const sqlQuery = `
        SELECT z, x, y, mvt
        FROM \`${tileset}\`
        WHERE (${parentQuadkeysFilter}) AND (${tilesFilter})`;

    const begin = (new Date()).getTime();
    const result = await client.execute(sqlQuery);
    const end = (new Date()).getTime();

    console.log(end - begin);

    let mvts = [];
    let missedTiles = Object.assign(tiles, {});
    if (result && result.rows) {
        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows[i];
            if (row.f && row.f.length === 4) {
                const z = parseInt(row.f[0]['v']);
                const x = parseInt(row.f[1]['v']);
                const y = parseInt(row.f[2]['v']);
                const mvt = row.f[3]['v'];
                mvts.push({ z, x, y, buffer: decode(mvt) });
                missedTiles = missedTiles.filter((t) => !(t.z === z && t.x === x && t.y === y));
            }
        }

        console.log(`${mvts.length}/${result.totalRows}`);

        if (result.totalRows > mvts.length) {
            const missedmvts = await fetchTiles(client, missedTiles, tileset, quadKeyZoom);
            mvts = mvts.concat(missedmvts);
        }
    }

    return mvts;
}

function getQuadkeyFromTile (tile) {
    return getQuadkeyFromTileIndex(tile, '');
}

// function getOnedIntegerQuadkeyFromTile (tile) {
//     let index = getQuadkeyFromTileIndex(tile, '1');
//     return parseInt(index, 4);
// }

function getQuadkeyFromTileIndex (tile, index) {
    for (let z0 = tile.z; z0 > 0; z0--) {
        let b = 0;
        let mask = 1 << (z0 - 1);
        if ((tile.x & mask) !== 0) b++;
        if ((tile.y & mask) !== 0) b += 2;
        index += b.toString();
    }

    return index;
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

function tileFilter (tile) {
    return `(z = ${tile.z} AND x = ${tile.x} AND y = ${tile.y})`;
}
