/* eslint-disable */
"use strict";

const PARTITION_UNPARTITIONED = 0;

/**
 * Assigns partitions to zoom levels given the number of partitions and zoom ranges available
 * Partitions always start at 1 (0 is used for outside levels) and end at the **partitions** parameter
 *
 * On the default situation (zmin = 0) we assign to the max zoom level, 3/4ths of the available partitions
 * since approximately 75% of the tiles are always found in the highest zoom. Then, we assign 75%
 * of the **remaining** space to the zoom level right below it, 75%(75%(75%)) to the next one, and so on.
 *
 * When (zmin != 0) we divide the "saved" partition space in the same proportion as the full partition table
 *
 * When (zstep != 1) we assign those partitions to the next valid zoom level
 */
function partition_range_by_zoom(partition_count, param = { z, zmin, zmax, zstep }) {

    if (param.z < 0 || param.zmin < 0 || param.zmax < 0 || param.zstep < 1 ||
        param.z < param.zmin || param.z > param.zmax || param.partition_count < 1 ||
        (param.z != param.zmin && ((param.z - param.zmin) % param.zstep) !== 0)) {
        return { min: PARTITION_UNPARTITIONED, max: PARTITION_UNPARTITIONED };
    }

    /* Adapt levels to always start from 0 */
    const zstep = param.zstep;
    const zmin = 0;
    let zmax = param.zmax - param.zmin;
    zmax = zmax - (zmax % zstep);
    let z = param.z - param.zmin;
    let range_initial_z = z - zstep + 1;

    const global_start = 1;
    const global_end = partition_count;

    if (zmin == zmax || global_start == global_end) {
        return { min: global_start, max: global_end };
    }

    /* Note that the z0 level gets special treatment since it gets the whole 100% of its remaining space */
    let z_partitions = 0;
    let partition_start;
    if (z == 0) {
        z_partitions = 4 * global_end / Math.pow(4, zmax + 1);
        partition_start = 0;
    } else {
        for (let acc = range_initial_z; acc <= z; acc++) {
            z_partitions += 3 * global_end / Math.pow(4, zmax - acc + 1);
        }
        partition_start = global_end / Math.pow(4, zmax - range_initial_z + 1);
    }
    const partition_end = partition_start + z_partitions;
    /* We round the start (instead of using floor) to give the lower zoom levels more partitions as 
     * they tend to be overcrowded, especially in rectangles with a great difference between height and width
     */
    partition_start = Math.round(partition_start);
    return {
        min: partition_start + global_start,
        max: Math.min(global_end, Math.max(Math.floor(partition_end), partition_start) + global_start)
    };
}

/* Finds the position of `target` inside the Gilbert curve defined by the rectangle:
 * cursor: Current position (start)
 * vector_main: Main direction of movement.
 *              It should move only on one axis, and it can be positive or negative.
 * vector_sec: Secondary direction of movement. Orthogonal to and smaller than vector_main.
 *
 * This is currently recursive, so the value is being add up inside target.counter
 */
function gilbert2d(cursor = { x, y },
    vector_main = { x, y },
    vector_sec = { x, y },
    target = { counter, x, y }) {
    /* Vector direction of movement (-1, 0 or +1) */
    const main_dirx = Math.sign(vector_main.x);
    const main_diry = Math.sign(vector_main.y);
    const sec_dirx = Math.sign(vector_sec.x);
    const sec_diry = Math.sign(vector_sec.y);

    const xmin = Math.min(cursor.x, cursor.x + vector_main.x - main_dirx + vector_sec.x - sec_dirx);
    const xmax = Math.max(cursor.x, cursor.x + vector_main.x - main_dirx + vector_sec.x - sec_dirx);
    const ymin = Math.min(cursor.y, cursor.y + vector_main.y - main_diry + vector_sec.y - sec_diry);
    const ymax = Math.max(cursor.y, cursor.y + vector_main.y - main_diry + vector_sec.y - sec_diry);
    if (target.x < xmin || target.x > xmax || target.y < ymin || target.y > ymax) {
        /* The tile we are looking for is not insde this rectangle. Add up its size and do a fast exit */
        target.counter += (xmax - xmin + 1) * (ymax - ymin + 1);
        return -1;
    }

    /* We can calculate the magnitude of the vectors this way because one of the coordinates
     * will always be 0 */
    const vector_main_magnitude = Math.abs(vector_main.x + vector_main.y);
    const vector_sec_magnitude = Math.abs(vector_sec.x + vector_sec.y);

    if (vector_main_magnitude == 1 || vector_sec_magnitude == 1) {
        /* We have either one row or one column. Either way, the position is the distance between
         * the current point and the target */
        target.counter += Math.abs((cursor.x - target.x) + (cursor.y - target.y));
        return target.counter;
    }

    const vector_main_half = {
        x: Math.floor(vector_main.x / 2),
        y: Math.floor(vector_main.y / 2)
    };

    if (2 * vector_main_magnitude > 3 * vector_sec_magnitude) {
        const vector_main_half_magnitude = Math.abs(vector_main_half.x + vector_main_half.y);
        if ((vector_main_half_magnitude % 2) && (vector_main_magnitude > 2)) {
            /* Prefer even steps */
            vector_main_half.x += main_dirx;
            vector_main_half.y += main_diry;
        }

        /* We split the main vector into 2 parts */
        const first = gilbert2d({ x: cursor.x, y: cursor.y },
            vector_main_half,
            vector_sec,
            target);
        if (first !== -1)
            return first;
        return gilbert2d({ x: cursor.x + vector_main_half.x, y: cursor.y + vector_main_half.y },
            { x: vector_main.x - vector_main_half.x, y: vector_main.y - vector_main_half.y },
            vector_sec,
            target);
    } else {
        const vector_sec_half = {
            x: Math.floor(vector_sec.x / 2),
            y: Math.floor(vector_sec.y / 2)
        };
        const vector_sec_half_magnitude = Math.abs(vector_sec_half.x + vector_sec_half.y);
        if ((vector_sec_half_magnitude % 2) && (vector_sec_magnitude > 2)) {
            /* Prefer even steps */
            vector_sec_half.x += sec_dirx;
            vector_sec_half.y += sec_diry;
        }

        /* We split the whole rectangle into 3 parts */

        /* Bottom half left (flipped so it finishes on top of the starting point) */
        const first = gilbert2d({ x: cursor.x, y: cursor.y },
            vector_sec_half,
            vector_main_half,
            target);
        if (first !== -1)
            return first;

        /* Top (left to right) */
        const second = gilbert2d({ x: cursor.x + vector_sec_half.x, y: cursor.y + vector_sec_half.y },
            vector_main,
            { x: vector_sec.x - vector_sec_half.x, y: vector_sec.y - vector_sec_half.y },
            target);
        if (second !== -1)
            return second;

        /* Bottom half right */
        return gilbert2d({
            x: cursor.x + (vector_main.x - main_dirx) + (vector_sec_half.x - sec_dirx),
            y: cursor.y + (vector_main.y - main_diry) + (vector_sec_half.y - sec_diry)
        },
            { x: - vector_sec_half.x, y: - vector_sec_half.y },
            { x: - (vector_main.x - vector_main_half.x), y: - (vector_main.y - vector_main_half.y) },
            target);
    }
}

/**
 * Given a rectangle coordinate (x : [0, width) ^ y : [ 0 .. height)) and its height and width,
 * it returns the position of the given coordinate in the Gilbert curve filling the rectangle
 * The result will be an integer number n : [0, (width * height) - 1]
 */
function gilbert2d_tile(target_tile = { x, y }, width, height) {
    if (width < 1 || height < 1)
        throw `Invalid Gilbert rectangle. Got: Width (${width}). Height: (${height})`;
    const tile = { x: target_tile.x, y: target_tile.y, counter: 0 };
    const start_point = { x: 0, y: 0 };

    let main_vector = { x: 0, y: height };
    let secondary_vector = { x: width, y: 0 };
    if (width > height) {
        main_vector = { x: width, y: 0 };
        secondary_vector = { x: 0, y: height };
    }
    return gilbert2d(start_point, main_vector, secondary_vector, tile);
}

export default class GilbertPartition {
    /**
     * partition_count: Number of partitions assigned for the whole dataset
     * z_range: Range of accepted zoom levels (e.g: { zmin: 0, zmax: 15 })
     * zmax_bbox: Bounding box of the dataset for the maximum accepted zoom level (i.e. z_range.zmax)
     *            These are tile coordinates (x, y) not geography coordinates
     */
    constructor(partition_count,
        z_range = { zmin, zmax, zstep },
        zmax_bbox = { xmin, xmax, ymin, ymax }) {
        this.partition_count = parseInt(partition_count);
        this.z_range = {
            zmin: parseInt(z_range.zmin),
            zmax: parseInt(z_range.zmax),
            zstep: parseInt(z_range.zstep)
        };
        this.zmax_bbox = {
            xmin: parseInt(zmax_bbox.xmin),
            xmax: parseInt(zmax_bbox.xmax),
            ymin: parseInt(zmax_bbox.ymin),
            ymax: parseInt(zmax_bbox.ymax)
        };

        if (!partition_count || partition_count < 1)
            throw `Unexpected partition count. Expected a positive integer. Got ${partition_count}`;
        if (!this.z_range)
            throw `Missing z_range`;
        if (isNaN(this.z_range.zmin) || isNaN(this.z_range.zmax) || isNaN(this.z_range.zstep))
            throw `Invalid z_range. Both zmin, zmax and zstep need to be defined. Got ${JSON.stringify(z_range)}`;
        if (this.z_range.zmin > this.z_range.zmax || this.z_range.zmin < 0 || this.zstep < 1)
            throw `Invalid z_range received. Got (${JSON.stringify(z_range)})`;
        if (!this.zmax_bbox)
            throw `Missing zmax_bbox`;
        if (isNaN(this.zmax_bbox.xmin) || isNaN(this.zmax_bbox.xmax) ||
            isNaN(this.zmax_bbox.ymin) || isNaN(this.zmax_bbox.ymax))
            throw `Invalid zmax_bbox. All xmin, xmax, ymin and ymax need to be defined. Got (${JSON.stringify(zmax_bbox)})`;
        if (this.zmax_bbox.xmin > this.zmax_bbox.xmax || this.zmax_bbox.xmin < 0 ||
            this.zmax_bbox.ymin > this.zmax_bbox.ymax || this.zmax_bbox.ymin < 0)
            throw `Invalid bbox received. Got (${JSON.stringify(zmax_bbox)})`;
    }

    getPartition(tile = { z: 0, x: 0, y: 0 }) {
        const rxmin = this.zmax_bbox.xmin >> (this.z_range.zmax - tile.z);
        const rxmax = this.zmax_bbox.xmax >> (this.z_range.zmax - tile.z);
        const rymin = this.zmax_bbox.ymin >> (this.z_range.zmax - tile.z);
        const rymax = this.zmax_bbox.ymax >> (this.z_range.zmax - tile.z);
        if (tile.z < this.z_range.zmin || tile.z > this.z_range.zmax ||
            tile.x < rxmin || tile.x > rxmax ||
            tile.y < rymin || tile.y > rymax) {
            return PARTITION_UNPARTITIONED;
        }

        const partition_range = partition_range_by_zoom(this.partition_count,
            { z: tile.z, zmin: this.z_range.zmin, zmax: this.z_range.zmax, zstep: this.z_range.zstep });
        const usable_partitions = partition_range.max - partition_range.min + 1;
        if (usable_partitions == 1) {
            return partition_range.min;
        }

        /* We switch to a rectangle starting at 0, 0 so it's easier to reason about it
         * The rectangle goes from (0, 0) to (rwidth - 1, rheight - 1)
         */
        const x = tile.x - rxmin;
        const y = tile.y - rymin;
        const rwidth = rxmax - rxmin + 1;
        const rheight = rymax - rymin + 1;
        const rectangle_size = rwidth * rheight;

        /* We need to divide this **rectangle** into equal sized areas, so what we do is to create a
         * Hilbert curve and then divide this 1d line into the necessary parts.
         *
         * If this was a perfect square, we would interleave bits from x and y, but in a rectangle
         * that would leave many empty spaces, so the partitions would be irregular (or some even empty)
         *
         * Instead we use a Generalized Hilbert curve based on https://github.com/jakubcerveny/gilbert
         * by Jakub Červený
         *
         */
        const gilbert_position = gilbert2d_tile({ x: x, y: y }, rwidth, rheight);
        if (gilbert_position === -1 || gilbert_position >= rwidth * rheight) {
            throw `Unexpected gilbert partition (${gilbert_position}) for tile ${tile.z}/${tile.x}/${tile.y} ` +
            `=> ${x}/${y} : ${rwidth}, ${rheight})`;
        }

        /* The gilbert_position goes from 0 to rectangle_size - 1 */
        return partition_range.min + Math.floor(usable_partitions * gilbert_position / rectangle_size);
    }
}
