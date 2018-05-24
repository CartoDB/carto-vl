import ShaderCache from './ShaderCache';

let programID = 1;

const shaderCache = new ShaderCache();

export function compileProgram(gl, glslVS, glslFS) {
    const VS = compileShader(gl, glslVS, gl.VERTEX_SHADER);
    const FS = compileShader(gl, glslFS, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, VS);
    gl.attachShader(program, FS);
    gl.linkProgram(program);
    gl.deleteShader(VS);
    gl.deleteShader(FS);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error('Unable to link the shader program: ' + gl.getProgramInfoLog(program));
    }

    return {
        program: program,
        programID: programID++
    };
}

function compileShader(gl, sourceCode, type) {
    if (shaderCache.has(gl, sourceCode)) {
        return shaderCache.get(gl, sourceCode);
    }
    const shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error('An error occurred compiling the shaders: ' + log + '\nSource:\n' + sourceCode);
    }
    shaderCache.set(gl, sourceCode, shader);
    return shader;
}
