export default class ProjectionHelper {
    constructor (dataframe) {
        this.dataframe = dataframe;
    }

    // Reference pointing to dataframe, to be in sync with its updates
    get matrix () { return this.dataframe.matrix; }

    toNDC (x, y) {
        const { ox, oy, ow } = this.toClipSpace(x, y);

        // Normalize by W
        return { x: ox / ow, y: oy / ow };
    }

    toClipSpace (x, y) {
        const matrix = this.matrix;
        const ox = matrix[0] * x + matrix[4] * y + matrix[12];
        const oy = matrix[1] * x + matrix[5] * y + matrix[13];
        const ow = matrix[3] * x + matrix[7] * y + matrix[15];

        return { ox, oy, ow };
    }
}
