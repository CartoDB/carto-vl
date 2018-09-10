import BaseExpression from '../base';

export default class ListGeneric extends BaseExpression {
    _applyToShaderSource (getGLSLforProperty) {
        const childGLSL = this.elems.map(elem => elem._applyToShaderSource(getGLSLforProperty));
        return {
            preface: childGLSL.map(c => c.preface).join('\n'),
            inline: childGLSL.map(c => c.inline)
        };
    }

    _resolveAliases (aliases) {
        this.elems.map(c => c._resolveAliases(aliases));
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
    }
}
