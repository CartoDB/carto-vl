
export default class RenderLayer {
    constructor() {
        this.dataframes = [];
        this.renderer = null;
        this.style = null;
        this.type = null;
    }
    // Performance-intensive. The required allocation and copy of resources will happen synchronously.
    // To achieve good performance, avoid multiple calls within the same event, particularly with large dataframes.
    addDataframe(dataframe) {
        if (!this.type) {
            this.type = dataframe.type;
        } else if (this.type != dataframe.type) {
            throw new Error('Layer dataframes must always be of the same type');
        }
        dataframe.bind(this.renderer);
        this.dataframes.push(dataframe);
    }

    // Removes a dataframe for the renderer. Freeing its resources.
    removeDataframe(dataframe) {
        this.dataframes = this.dataframes.filter(t => t !== dataframe);
    }
}
