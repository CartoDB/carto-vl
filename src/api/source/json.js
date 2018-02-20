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

            fetch('http://localhost:3000/', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                // mode: 'no-cors'
            }).then(response => {
                response.json().then(result => {
                    console.log("-----")
                    console.log(result);
                    const geometry = new Float32Array(result);
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
                });
            });
        }
    }


    free() {
        this._client.free();
    }
}
