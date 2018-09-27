precision highp float;

attribute vec2 vertexPosition;

uniform vec2 gridScale;
uniform vec2 gridOffset;

varying highp vec2 uv;

attribute vec2 featureID;
varying highp vec2 featureIDVar;

void main(void) {
    featureIDVar = abs(featureID);
    uv = vertexPosition;
    gl_Position = vec4(vertexPosition*gridScale - gridOffset, 0.5, 1.);
}
