import BaseExpression from '../base';

export default class ListGeneric extends BaseExpression {
    get value () {
        return this.elems.map(c => c.value);
    }

    eval (feature) {
        return this.elems.map(c => c.eval(feature));
    }

    _applyToShaderSource (getGLSLforProperty) {
        const childGLSL = this.elems.map(elem => elem._applyToShaderSource(getGLSLforProperty));
        return {
            preface: childGLSL.map(c => c.preface).join('\n'),
            inline: childGLSL.map(c => c.inline)
        };
    }
}
