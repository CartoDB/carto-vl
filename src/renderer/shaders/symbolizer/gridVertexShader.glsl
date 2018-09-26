precision highp float;

attribute vec2 vertexPosition;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;

varying highp vec2 uv;

void main(void) {
    uv = vertexPosition;
    gl_position = vertexPosition*vertexScale + vertexOffset;
}
