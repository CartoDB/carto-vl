import { createShader } from '../shaders';

export function compileShader(gl, template, expressions) {
    let tid = {};
    const getPropertyAccessCode = name => {
        if (tid[name] === undefined) {
            tid[name] = Object.keys(tid).length;
        }
        return `texture2D(propertyTex${tid[name]}, featureID).a`;
    };
    let codes = {};
    Object.keys(expressions).forEach(exprName => {
        const expr = expressions[exprName];
        const exprCodes = expr._applyToShaderSource(getPropertyAccessCode);
        codes[exprName + '_preface'] = exprCodes.preface;
        codes[exprName + '_inline'] = exprCodes.inline;
    });
    codes.propertyPreface = Object.keys(tid).map(name => `uniform sampler2D propertyTex${tid[name]};`).join('\n');

    const shader = createShader(gl, template, codes);
    Object.keys(tid).map(name => {
        tid[name] = gl.getUniformLocation(shader.program, `propertyTex${tid[name]}`);
    });
    Object.values(expressions).forEach(expr => {
        expr._postShaderCompile(shader.program, gl);
    });

    shader.tid = tid;
    return shader;
}
