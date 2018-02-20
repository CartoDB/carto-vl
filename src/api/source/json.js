import * as R from '../../core/renderer';

export default class JSON {
    constructor() {
    }

    bindLayer(addDataframe, removeDataframe) {
        this._addDataframe = addDataframe;
        this._removeDataframe = removeDataframe;
    }

    requestData(viewport, mns, resolution) {
        if (!this.metadataInit) {
            this.metadataInit = true;
            return new Promise(resolve => {
                resolve({
                    featureCount: 1000,
                    columns: [],
                });
            });
        } else if (!this.dataInit) {
            const geometry = new Float32Array([0.25, 0.25, 0.75, 0.75, 0, 0]);
            const properties = [];
            const dataframe = new R.Dataframe(
                { x: 0, y: 0 },
                1,
                geometry,
                properties,
            );
            dataframe.type = 'point';
            dataframe.active = true;
            dataframe.size = 3;

            this._addDataframe(dataframe);
            this.dataInit = true;
        }
    }

    free() {
        this._client.free();
    }
}
