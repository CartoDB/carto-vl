import { decode } from 'base64-arraybuffer';

export async function fetchTiles (client, tiles, tileset, quadKeyZoom) {
    const ids = getDecimalQuadKeysFromTiles(tiles);
    const idsFilter = ids.length ? `id IN (${ids})` : 'TRUE';
    const quadKeys = getDecimalQuadKeysFromTiles(tiles, quadKeyZoom);
    const quadKeysFilter = quadKeys.length ? `quadkey IN (${quadKeys})` : 'TRUE';
    const sqlQuery = `
        SELECT z, x, y, mvt
        FROM \`${tileset}\`
        WHERE (${quadKeysFilter}) AND (${idsFilter})`;

    const result = await client.execute(sqlQuery);

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

function getDecimalQuadKeysFromTiles (tiles, quadKeyZoom) {
    if (quadKeyZoom === 0) {
        return [];
    }

    let result = new Set();
    for (let tile of tiles) {
        result.add(getDecimalQuadKeysFromTile(tile, quadKeyZoom));
    }

    return [...result].filter(x => x !== null);
}

function getDecimalQuadKeysFromTile (tile, quadKeyZoom) {
    if (tile.z === 0) {
        return null;
    }

    quadKeyZoom = (quadKeyZoom === undefined || quadKeyZoom === null || quadKeyZoom < 0) ? tile.z : quadKeyZoom;

    let index = '';
    for (let z0 = tile.z; z0 > 0; z0--) {
        let b = 0;
        let mask = 1 << (z0 - 1);
        if ((tile.x & mask) !== 0) b++;
        if ((tile.y & mask) !== 0) b += 2;
        index += b.toString();
    }

    if (index.length >= quadKeyZoom) {
        index = index.substring(0, quadKeyZoom);
    } else {
        index += '0'.repeat(quadKeyZoom - index.length);
    }

    return parseInt(index, 4);
}
