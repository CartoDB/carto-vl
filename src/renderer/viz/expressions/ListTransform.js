import Base from './base';
import { checkType } from './utils';

export default class ListTransform extends Base {
    _bindMetadata (meta) {
        super._bindMetadata(meta);
        this._getChildren().forEach((transform, i) => checkType('ListTransformation', `ListTransformation[${i}]`, 0, 'transformation', transform));
        this.type = 'transformation';
    }

    eval (feature) {
        return this.elems.map(elem => elem.eval(feature));
    }

    _applyToShaderSource (getGLSLforProperty) {
        const childGLSL = this.elems.map(elem => elem._applyToShaderSource(getGLSLforProperty));
        return {
            preface: this._prefaceCode(`
                ${childGLSL.map(c => c.preface).join('\n')}

                vec2 listTransform${this._uid}(vec2 p) {
                    ${childGLSL.map(c => `p = ${c.inline}(p);`).join('\n')}
                    return p;
                }
            `),
            inline: `listTransform${this._uid}`
        };
    }
}
