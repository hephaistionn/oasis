const THREE = require('three');

const vertShader = "" +
    "precision highp float; \n" +
    "precision highp int; \n" +
    "uniform mat4 modelMatrix; \n" +
    "uniform mat4 viewMatrix;\n" +
    "uniform mat4 projectionMatrix;\n" +
    "attribute vec3 position; \n" +
    "attribute vec3 normal; \n" +
    "attribute vec2 uv; \n" +
    "varying vec3 vNormal; \n" +
    "void main() {" +
    "   vec4 worldPosition = modelMatrix * vec4(position, 1.0 ); \n" +
    "   vNormal = (modelMatrix * vec4(normal, 0.0)).xyz; \n" +
    "   gl_Position = projectionMatrix * viewMatrix * worldPosition; \n" +
    "} ";


const fragShader = "" +
    "precision highp float; \n" +
    "precision highp int; \n" +
    "varying vec3 vNormal; \n" +
    "uniform vec3 color; \n" +
    "" +
    "void main(void) { \n" +
    "   vec3 ambientLightColor = vec3(0.6);\n" +
    "   vec3 lightDirection = vec3(0.2585,0.9307,-0.2585);\n" +
    "   float light = dot(lightDirection, normalize( vNormal ));\n"+
    "   vec3 colorLight = max(color  * light, color * ambientLightColor); \n" +
    "   gl_FragColor = vec4(colorLight, 1.0); \n" +
    "}";

const uniforms = THREE.UniformsUtils.merge([]);
uniforms.color = { type: "c", value: new THREE.Color(0xeeeeee) }
const material = new THREE.RawShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertShader,
    fragmentShader: fragShader
});

module.exports = material;

