#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_random;
uniform vec3 u_background_color;

out vec4 outColor;

#define PI 3.1415926538

void main() {
    float phase = (sin(u_time + PI/2.0) + 1.0) / 2.0;
    vec3 color = u_background_color * phase;
    outColor = vec4(color.r, color.g, color.b, 1.0);
}
