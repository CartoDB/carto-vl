precision highp float;

attribute vec2 vertexPosition;

uniform vec2 gridScale;
uniform vec2 gridOffset;

varying highp vec2 uv;

attribute vec2 featureID;
varying highp vec2 featureIDVar;

void main(void) {
    // WebGL complains if we don't reference and use featureID
    featureIDVar = abs(featureID);

    // The order of the grid pixels is from N to S => we must flip the v coordinate
    uv = vec2(vertexPosition[0], 1.0 - vertexPosition[1]);
    gl_Position = vec4(vertexPosition*gridScale - gridOffset, 0.5, 1.);
}
