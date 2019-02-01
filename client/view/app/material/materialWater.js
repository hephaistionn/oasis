const THREE = require('three');

const vertShader = "" +
    "precision highp float; \n" +
    "precision highp int; \n" +
    "uniform mat4 modelMatrix; \n" +
    "uniform mat4 viewMatrix;\n" +
    "uniform mat4 projectionMatrix;\n" +
    "attribute vec3 position; \n" +
    "attribute float lighting; \n" +
    "varying float vlighting; \n" +
    "void main() {" +
    "   vec3 positionPlan = vec3(position.x,position.y,position.z); \n" +
    "   vec4 worldPosition = modelMatrix * vec4(positionPlan, 1.0 ); \n" +
    "   vlighting = lighting; \n" +
    "   gl_Position = projectionMatrix * viewMatrix * worldPosition; \n" +
    "} ";


const fragShader = "" +
    "precision highp float; \n" +
    "precision highp int; \n" +
    "varying float vlighting; \n" +
    "" +
    "void main(void) { \n" +
    "   vec3 color = vec3(0.5,0.78,1.0); \n" +
    "   gl_FragColor.xyz = color  * vlighting; \n" +
    "   gl_FragColor.a = 0.50; \n" +
    "}";

const uniforms = THREE.UniformsUtils.merge([]);
const material = new THREE.RawShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertShader,
    fragmentShader: fragShader,
    transparent: true
});

module.exports = material;

