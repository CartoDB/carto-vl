import Expression from './expression';

export default class Property extends Expression {
    /**
     * @jsapi
     * @param {*} name Property/column name
     */
    constructor(name) {
        if (typeof name !== 'string' || name == '') {
            throw new Error(`Invalid property name '${name}'`);
        }
        super({});
        this.name = name;
    }
    _compile(meta) {
        const metaColumn = meta.columns.find(c => c.name == this.name);
        if (!metaColumn) {
            throw new Error(`Property '${this.name}' does not exist`);
        }
        this.type = metaColumn.type;
        if (this.type == 'category') {
            this.numCategories = metaColumn.categoryNames.length;
        }
        super._setGenericGLSL((childInlines, uniformIDMaker, propertyTIDMaker) => `p${propertyTIDMaker(this.name)}`);
    }
    _getMinimumNeededSchema() {
        return {
            columns: [
                this.name
            ]
        };
    }
}