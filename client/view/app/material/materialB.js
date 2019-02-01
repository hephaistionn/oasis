const THREE = require('three');

const vertShader = "" +
    "precision highp float; \n" +
    "precision highp int; \n" +
    "uniform mat4 modelMatrix; \n" +
    "uniform mat4 viewMatrix;\n" +
    "uniform mat4 projectionMatrix;\n" +
    "uniform float morphTargetInfluences[ 2 ];"+
    "attribute vec3 position; \n" +
    "attribute vec3 normal; \n" +
    "attribute vec2 uv; \n" +
    "attribute vec3 morphTarget0; \n" +
    "attribute vec3 morphTarget1; \n" +
    "varying vec3 vNormal; \n" +
    "varying vec2 vUv; \n" +
    "void main() {" +
    "   vec3 transformed = vec3( position );\n"+
    "   transformed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];\n"+
    "   transformed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];\n"+
    "   vec4 worldPosition = modelMatrix * vec4(transformed, 1.0 ); \n" +
    "   vNormal = (modelMatrix * vec4(normal, 0.0)).xyz; \n" +
    "   vUv = uv;  \n" +
    "   gl_Position = projectionMatrix * viewMatrix * worldPosition; \n" +
    "} ";


const fragShader = "" +
    "precision highp float; \n" +
    "precision highp int; \n" +
    "varying vec3 vNormal; \n" +
    "varying vec2 vUv; \n" +
    "uniform sampler2D map; \n"+
    "" +
    "void main(void) { \n" +
    "   vec3 ambientLightColor = vec3(0.6);\n" +
    "   vec3 lightDirection = vec3(0.2585,0.9307,-0.2585);\n" +
    "   vec4 texelColor = texture2D( map, vUv );\n" +
    "   float light = dot(lightDirection, normalize( vNormal ));\n"+
    "   vec3 color = max(texelColor.xyz  * light, texelColor.xyz * ambientLightColor); \n" +
    "   gl_FragColor = vec4(color, texelColor.a); \n" +
    "}";

const uniforms = THREE.UniformsUtils.merge([]);
uniforms.map = {type: 't', value: THREE.loadTexture('pic/texture_00.jpg')};
const material = new THREE.RawShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertShader,
    fragmentShader: fragShader,
    morphTargets: true
});



module.exports = material;

