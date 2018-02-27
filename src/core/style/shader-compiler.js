
const cache = {};

export function compileShader(gl, styleRootExpr, shaderCreator) {
    let uniformIDcounter = 0;
    let tid = {};
    let shader = null;
    const colorModifier = styleRootExpr._applyToShaderSource(() => uniformIDcounter++, name => {
        if (tid[name] !== undefined) {
            return tid[name];
        }
        tid[name] = Object.keys(tid).length;
        return tid[name];
    });
    // eslint-disable-next-line 
    if (false && cache[JSON.stringify(colorModifier)]) {  //TODO: we need a cache for each shader
        shader = cache[JSON.stringify(colorModifier)];
    } else {
        shader = shaderCreator(gl, colorModifier.preface, colorModifier.inline);
        //console.log("COMPILE", cache)
        cache[JSON.stringify(colorModifier)] = shader;
    }
    styleRootExpr._postShaderCompile(shader.program, gl);
    return {
        tid: tid,
        shader: shader
    };
}
