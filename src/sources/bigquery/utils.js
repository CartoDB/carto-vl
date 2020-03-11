import { decode } from 'base64-arraybuffer';

export async function fetchTiles (tiles, tileset, client) {
    const tilesFilter = tiles.map((tile) => _tileFilter(tile)).join(' OR ');
    const sqlQuery = `SELECT z,x,y,mvt FROM \`${tileset}\` WHERE ${tilesFilter}`;

    const result = await client.execute(sqlQuery);

    console.log(tiles, result)

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

function _tileFilter (tile) {
    return `(z = ${tile.z} AND x = ${tile.x} AND y = ${tile.y})`;
}
