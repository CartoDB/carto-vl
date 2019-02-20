import Cache from './Cache';
import CartoRuntimeError, { CartoRuntimeTypes as crt } from '../../errors/carto-runtime-error';

let programID = 1;
const shaderCache = new Cache();
const programCache = new Cache();

/**
 * Compile a webgl program.
 * Use a cache to improve speed.
 *
 * @param {WebGLRenderingContext} gl - The context where the program will be executed
 * @param {String} glslvertexShader - vertex shader code
 * @param {String} glslfragmentShader - fragment shader code
 */
export function compileProgram (gl, glslvertexShader, glslfragmentShader) {
    const code = glslvertexShader + glslfragmentShader;

    if (programCache.has(gl, code)) {
        return programCache.get(gl, code);
    }

    const shader = {};
    const vertexShader = _compileShader(gl, glslvertexShader, gl.VERTEX_SHADER);
    const fragmentShader = _compileShader(gl, glslfragmentShader, gl.FRAGMENT_SHADER);

    shader.program = gl.createProgram();

    gl.attachShader(shader.program, vertexShader);
    gl.attachShader(shader.program, fragmentShader);
    gl.linkProgram(shader.program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(shader.program, gl.LINK_STATUS)) {
        throw new CartoRuntimeError(`${crt.WEB_GL} Unable to link the shader program: ${gl.getProgramInfoLog(shader.program)}.`);
    }

    shader.programID = programID++;
    programCache.set(gl, code, shader);

    return shader;
}

function _compileShader (gl, sourceCode, type) {
    if (shaderCache.has(gl, sourceCode)) {
        return shaderCache.get(gl, sourceCode);
    }

    const shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new CartoRuntimeError(`${crt.WEB_GL} An error occurred compiling the shaders: ${log}\nSource:\n${sourceCode}`);
    }

    shaderCache.set(gl, sourceCode, shader);

    return shader;
}

export function createShaderFromTemplate (gl, glslTemplate, codes) {
    let vertexShader = glslTemplate.vertexShader;
    let fragmentShader = glslTemplate.fragmentShader;

    Object.keys(codes).forEach(codeName => {
        vertexShader = vertexShader.replace('$' + codeName, codes[codeName]);
        fragmentShader = fragmentShader.replace('$' + codeName, codes[codeName]);
    });

    const shader = compileProgram(gl, vertexShader, fragmentShader);

    shader.vertexPositionAttribute = gl.getAttribLocation(shader.program, 'vertexPosition');
    shader.featureIdAttr = gl.getAttribLocation(shader.program, 'featureID');
    shader.normalAttr = gl.getAttribLocation(shader.program, 'normal');

    shader.colorTexture = gl.getUniformLocation(shader.program, 'colorTex');
    shader.strokeColorTexture = gl.getUniformLocation(shader.program, 'strokeColorTex');
    shader.strokeWidthTexture = gl.getUniformLocation(shader.program, 'strokeWidthTex');
    shader.widthTexture = gl.getUniformLocation(shader.program, 'widthTex');
    shader.orderMinWidth = gl.getUniformLocation(shader.program, 'orderMinWidth');
    shader.orderMaxWidth = gl.getUniformLocation(shader.program, 'orderMaxWidth');
    shader.filterTexture = gl.getUniformLocation(shader.program, 'filterTex');
    shader.normalScale = gl.getUniformLocation(shader.program, 'normalScale');
    shader.resolution = gl.getUniformLocation(shader.program, 'resolution');
    shader.matrix = gl.getUniformLocation(shader.program, 'matrix');

    return shader;
}
