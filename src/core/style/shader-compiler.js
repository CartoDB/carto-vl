export function compileShader(gl, styleRootExpr, shaderCreator) {
    let uniformIDcounter = 0;
    let tid = {};
    const colorModifier = styleRootExpr._applyToShaderSource(() => uniformIDcounter++, name => {
        if (tid[name] !== undefined) {
            return tid[name];
        }
        tid[name] = Object.keys(tid).length;
        return tid[name];
    });
    const shader = shaderCreator(gl, colorModifier.preface, colorModifier.inline);
    styleRootExpr._postShaderCompile(shader.program, gl);
    return {
        tid: tid,
        shader: shader
    };
}
