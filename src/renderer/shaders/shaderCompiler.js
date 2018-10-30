import { createShaderFromTemplate } from './utils';

class IDGenerator {
    constructor () {
        this._ids = new Map();
    }
    getID (expression) {
        if (this._ids.has(expression)) {
            return this._ids.get(expression);
        }
        const id = this._ids.size;
        this._ids.set(expression, id);
        return id;
    }
}

export function compileShader (gl, template, expressions) {
    let tid = {};
    const getPropertyAccessCode = name => {
        if (tid[name] === undefined) {
            tid[name] = Object.keys(tid).length;
        }
        return `texture2D(propertyTex${tid[name]}, abs(featureID)).a`;
    };

    let codes = {};

    const idGen = new IDGenerator();

    Object.keys(expressions).forEach(exprName => {
        const expr = expressions[exprName];
        expr._setUID(idGen);
        const exprCodes = expr._applyToShaderSource(getPropertyAccessCode);
        codes[exprName + '_preface'] = exprCodes.preface;
        codes[exprName + '_inline'] = exprCodes.inline;
    });

    codes.propertyPreface = Object.keys(tid).map(name => `uniform sampler2D propertyTex${tid[name]};`).join('\n');

    const shader = createShaderFromTemplate(gl, template, codes);

    Object.keys(tid).map(name => {
        tid[name] = gl.getUniformLocation(shader.program, `propertyTex${tid[name]}`);
    });

    Object.values(expressions).forEach(expr => {
        expr._postShaderCompile(shader.program, gl);
    });

    return {
        shader,
        textureIds: tid,
        _codes: codes,
        _template: template
    };
}
