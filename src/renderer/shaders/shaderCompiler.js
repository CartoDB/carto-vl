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

function isGridShader (template) {
    return template.fragmentShader.match(/GRID!!!/);
}

export function compileShader (gl, template, expressions, viz) {
    let tid = {};
    const getPropertyAccessCode = (name, isLngLat = false) => {
        if (tid[name] === undefined) {
            tid[name] = Object.keys(tid).length;
        }

        if (isGridShader(template)) {
            let uv = 'uv';
            if (isLngLat) {
                uv = 'LNGLAT_WM_UV(uv, gMinWM, gMaxWM, gMinLL, gMaxLL)';
            }
            return `texture2D(propertyTex${tid[name]}, ${uv}).a`;
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

    if (!shader.textureIds) {
        shader.textureIds = new Map();
    }

    shader.textureIds.set(viz, tid);

    // For debugging purposes
    shader._codes = codes;
    shader._template = template;

    return shader;
}
