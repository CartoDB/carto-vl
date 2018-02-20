import Expression from './expression';

export default class Count extends Expression {
    constructor() {
        super({});
    }
    _compile() {
        this.type = 'float';
        super._setGenericGLSL((childInlines, uniformIDMaker, propertyTIDMaker) => `p${propertyTIDMaker('_cartogl_count')}`);
    }
}