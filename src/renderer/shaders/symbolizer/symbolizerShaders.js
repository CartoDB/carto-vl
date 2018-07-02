import symbolizerFragmentShader from './symbolizerFragmentShader.glsl';
import symbolizerVertexShader from './symbolizerVertexShader.glsl';

export const symbolShaderGLSL = {
    vertexShader: `${symbolizerVertexShader}`,
    fragmentShader: `${symbolizerFragmentShader}`
};
