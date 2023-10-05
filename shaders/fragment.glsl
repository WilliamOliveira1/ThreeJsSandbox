uniform sampler2D texture1;
varying vec2 vUv;
varying vec3 vertexNormal;
void main() {
    float intensity = 1.1 - dot(vertexNormal, vec3(0.0, 0.0, 1.0));
    vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 0.6);
    vec3 pos = texture2D(texture1, vUv).xyz;
    gl_FragColor = vec4(atmosphere + pos, 1.1);
}