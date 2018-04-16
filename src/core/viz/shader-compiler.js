export function compileShader(gl, styleRootExpr, shaderCreator) {
    let tid = {};
    const colorModifier = styleRootExpr._applyToShaderSource(name => {
        if (tid[name] === undefined) {
            tid[name] = Object.keys(tid).length;
        }
        return `texture2D(propertyTex${tid[name]}, featureID).a`;
    });
    colorModifier.preface += Object.keys(tid).map(name => `uniform sampler2D propertyTex${tid[name]};`).join('\n');
    const shader = shaderCreator(gl, colorModifier.preface, colorModifier.inline);
    Object.keys(tid).map(name => {
        tid[name] = gl.getUniformLocation(shader.program, `propertyTex${tid[name]}`);
    });
    styleRootExpr._postShaderCompile(shader.program, gl);
    return {
        tid: tid,
        shader: shader
    };
}
