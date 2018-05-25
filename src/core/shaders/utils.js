import Cache from './Cache';

let programID = 1;
const shaderCache = new Cache();
const programCache = new Cache();

/**
 * Compile a webgl program.
 * Use a cache to improve speed.
 * 
 * @param {WebGLRenderingContext} gl - The context where the program will be executed
 * @param {string} glslVS - vertex shader code
 * @param {string} glslFS - fragment shader code
 */
export function compileProgram(gl, glslVS, glslFS) {
    const code = glslVS + glslFS;
    if (programCache.has(gl, code)) {
        return programCache.get(gl, code);
    }
    const VS = compileShader(gl, glslVS, gl.VERTEX_SHADER);
    const FS = compileShader(gl, glslFS, gl.FRAGMENT_SHADER);

    const program = createProgram(gl, VS, FS);
    programCache.set(gl, code, { program: program, programID: programID++ });
    return { program, programID };
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

function createProgram(gl, VS, FS) {
    const program = gl.createProgram();
    gl.attachShader(program, VS);
    gl.attachShader(program, FS);
    gl.linkProgram(program);
    gl.deleteShader(VS);
    gl.deleteShader(FS);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error('Unable to link the shader program: ' + gl.getProgramInfoLog(program));
    }
    return program;
}
