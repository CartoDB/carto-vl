export default class FeatureIdsHelper {
    constructor (dataframe) {
        this.dataframe = dataframe;
    }

    // References pointing to dataframe, to be in sync with its updates
    get decodedGeom () { return this.dataframe.decodedGeom; }
    get numFeatures () { return this.dataframe.numFeatures; }

    /**
     * Gets the featureId per each vertice.
     */
    getFeatureIds () {
        const breakpoints = this.decodedGeom.breakpoints;
        const isPointType = !breakpoints.length;

        if (isPointType) {
            return this._getFeatureIdsForPoints();
        } else {
            return this._getFeatureIdsForLinesOrPolygons();
        }
    }

    _getFeatureIdsForPoints () {
        const numVertices = this.decodedGeom.vertices.length;
        let { tableX, tableY } = this._createTablesXY();

        const ids = new Float32Array(numVertices);
        const inc = 1 / (1024 * 64);
        let index = 0;

        for (let i = 0; i < numVertices; i += 6) {
            ids[i + 0] = tableX[index];
            ids[i + 1] = tableY[index];

            if (ids[i + 0] === 0) {
                ids[i + 0] += inc;
            }
            if (ids[i + 1] === 0) {
                ids[i + 1] += inc;
            }

            ids[i + 2] = -ids[i + 0];
            ids[i + 3] = ids[i + 1];

            ids[i + 4] = ids[i + 0];
            ids[i + 5] = -ids[i + 1];
            index++;
        }

        return ids;
    }

    _getFeatureIdsForLinesOrPolygons () {
        const numVertices = this.decodedGeom.vertices.length;
        let { tableX, tableY } = this._createTablesXY();
        const breakpoints = this.decodedGeom.breakpoints;

        const ids = new Float32Array(numVertices);
        let index = 0;

        for (let i = 0; i < numVertices; i += 2) {
            while (i === breakpoints[index]) {
                index++;
            }
            ids[i + 0] = tableX[index];
            ids[i + 1] = tableY[index];
        }

        return ids;
    }

    _createTablesXY () {
        let tableX = {};
        let tableY = {};

        const { height, width } = this.dataframe.getSize();

        for (let k = 0; k < this.numFeatures; k++) {
            // Transform integer ID into a `vec2` to overcome WebGL 1 limitations,
            // output IDs will be in the `vec2([0,1], [0,1])` range
            tableX[k] = (k % width) / (width - 1);
            tableY[k] = height > 1 ? Math.floor(k / width) / (height - 1) : 0.5;
        }

        return { tableX, tableY };
    }
}
