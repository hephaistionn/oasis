const THREE = require('three');

const vertShader = "" +
    "precision highp float; \n" +
    "precision highp int; \n" +
    "uniform mat4 modelMatrix; \n" +
    "uniform mat4 viewMatrix;\n" +
    "uniform mat4 projectionMatrix;\n" +
    "attribute float walkable; \n" +
    "attribute vec3 position; \n" +
    "varying float vColor; \n" +
    "void main() {" +
    "   vec4 worldPosition = modelMatrix * vec4(position, 1.0 ); \n"+
    "   vColor = walkable; \n" +
    "   gl_Position = projectionMatrix * viewMatrix * worldPosition; \n"+
    "} ";


const fragShader = "" +
    "precision highp float; \n" +
    "precision highp int; \n" +
    "uniform sampler2D map; \n"+
    "varying float vColor; \n" +
    "void main(void) { \n" +
    "   if(vColor<1.0){ \n" +
    "       gl_FragColor =  vec4(1.0, 0.0, 0.0, 0.5); \n" +
    "   } else { \n" +
    "       gl_FragColor =  vec4(0.0, 0.0, 1.0, 0.5); \n" +
    "   }  \n"+
    "}";

const uniforms = THREE.UniformsUtils.merge([]);
const material = new THREE.RawShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertShader,
    fragmentShader: fragShader,
    transparent: true
});

module.exports = material;

