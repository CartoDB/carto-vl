 /**
  * An RSys defines a local coordinate system that maps the coordinates
  * in the range -1 <= x <= +1; -1 <= y <= +1 to an arbitrary rectangle
  * in an external coordinate system. (e.g. Dataframe coordinates to World coordinates)
  * It is the combination of a translation and anisotropic scaling.
  * @api
  * @typedef {object} RSys - Renderer relative coordinate system
  * @property {RPoint} center - Position of the local system in external coordinates
  * @property {number} scale - Y-scale (local Y-distance / external Y-distance)
  * @property {number} aspect - X/Y Aspect ratio. The X-scale is aspect*scale
 */

 /*
  * Random notes
  *
  * We can redefine Dataframe to use a Rsys instead of center, scale
  * and we can use an Rsys for the Renderer's canvas.
  *
  * Some interesting World coordinate systems:
  *
  * WM (Webmercator): represents a part of the world (excluding polar regions)
  * with coordinates in the range +/-WM_R for both X and Y. (positive orientation: E,N)
  *
  * NWMC (Normalized Webmercator Coordinates): represents the Webmercator *square*
  * with coordinates in the range +/-1. Results from dividing Webmercator coordinates
  * by WM_R. (positive orientation: E,N)
  *
  * TC (Tile coordinates): integers in [0, 2^Z) for zoom level Z
  * (positive orientation: E,S)
  *
  * An RSys's rectangle (its bounds) is the area covered by the local coordinates in
  * the range +/-1.
  *
  * When an RSys external coordinate system is WM or NWMC, we can compute:
  * * Minimum zoom level for which tiles are no larger than the RSys rectangle:
  *   Math.ceil(Math.log2(1 / r.scale));
  * * Maximum zoom level for which tiles are no smaller than the rectangle:
  *   Math.ceil(Math.log2(1 / r.scale));
  * (note that 1 / r.scale is the fraction of the World height that the local rectangle's height represents)
  *
  * We'll use the term World coordinates below for the *external* reference system
  * of an RSys (usually NWMC).
  */

/**
 * R coordinates to World
 * @api
 * @param {RSys} r - ref. of the passed coordinates
 * @param {number} x - x coordinate in r
 * @param {number} y - y coordinate in r
 * @return {RPoint} World coordinates
 */
function rToW(r, x, y) {
    return { x: x*r.scale*r.aspect + r.center.x, y: y*r.scale + r.center.y };
}

/**
 * World coordinates to local RSys
 * @api
 * @param {number} x - x W-coordinate
 * @param {number} y - y W-coordinate
 * @param {RSys} r - target ref. system
 * @return {RPoint} R coordinates
 */
function wToR(x, y, r) {
    return { x: (x - r.center.x)/(r.scale*r.aspect), y: (y - r.center.y)/r.scale };
}

/**
 * RSys of a tile (mapping local tile coordinates in +/-1 to NWMC)
 * @api
 * @param {number} x - TC x coordinate
 * @param {number} y - TC y coordinate
 * @param {number} z - Tile zoom level
 * @return {RSys}
 */
function tileRsys(x, y, z) {
    let max = Math.pow(2, z);
    return { scale: 1/max, center: { x: 2*(x + 0.5)/max - 1, y : 1 - 2*(y + 0.5)/max}, aspect: 1 };
}

/**
 * World extents of an Rsys
 * i.e. [rToW(r, -1, -1).x, rToW(r, -1, -1).y, rToW(r, 1, 1).x, rToW(r, 1, 1).y]
 * @api
 * @param {RSys} r
 * @return {Arrray} - [minx, miny, maxx, maxy] in W coordinates
 */
function rBounds(r) {
    const sx = r.scale*r.aspect;
    const sy = r.scale;
    return [r.center.x - sx, r.center.y - sy, r.center.x + sx, r.center.y + sy];
}

/**
 * Minimum zoom level for which tiles are no larger than the RSys rectangle
 * @api
 * @param {RSys} rsys
 * @return {number}
 */
function rZoom(rsys) {
    return Math.ceil(Math.log2(1. / rsys.scale));
}

/**
 * TC tiles that intersect the local rectangle of an RSys
 * (with the largest tile size no larger than the rectangle)
 * @param {RSys} rsys
 * @return {Array} - array of TC tiles {x, y, z}
 */
function rTiles(rsys) {
    ext = rBounds(rsys);
    return wRectangleTiles(rZoom(rsys), rBounds(rsys));
}

/**
 * TC tiles of a given zoom level that intersect a W rectangle
 * @param {number} z
 * @param {Array} - rectangle extents [minx, miny, maxx, maxy]
 * @return {Array} - array of TC tiles {x, y, z}
 */
function wRectangleTiles(z, wr) {
    const [w_minx, w_miny, w_maxx, w_maxy] = wr;
    const n = (1 << z); // for 0 <= z <= 30 equals Math.pow(2, z)
    // compute tile coordinate ranges
    const t_minx = Math.floor(n * (w_minx + 1) * 0.5);
    const t_maxx = Math.ceil(n * (w_maxx + 1) * 0.5) - 1;
    const t_miny = Math.floor(n * (1 - w_maxy) * 0.5);
    const t_maxy = Math.ceil(n * (1 - w_miny) * 0.5) - 1;
    let tiles = [];
    for (let x = t_minx; x <= t_maxx; ++x) {
        for (let y = t_miny; y <= t_maxy; ++y) {
            tiles.push({ x: x, y: y, z: z } );
        }
    }
    return tiles;
}
