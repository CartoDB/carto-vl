precision highp float;

attribute vec2 vertexPosition;

uniform vec2 gridScale;
uniform vec2 gridOffset;

varying highp vec2 uv;

void main(void) {
    uv = vertexPosition;
    gl_position = vertexPosition*gridScale + gridOffset;
}
