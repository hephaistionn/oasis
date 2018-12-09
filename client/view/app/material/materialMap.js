const THREE = require('three');

const vertShader = "" +
    "varying vec3 vNormal; \n" +
    "varying vec3 vAbsolutePosition; \n" +
    "void main() { \n" +
    "vec4 worldPosition = modelMatrix * vec4(position, 1.0 ); \n" +
    "vAbsolutePosition = worldPosition.xyz; \n" +
    "vNormal = normalMatrix * normal; \n" +
    "gl_Position = projectionMatrix * viewMatrix * worldPosition; \n" +
    "} ";


const fragShader = "" +

    "struct DirectionalLight { \n" +
    "   vec3 direction; \n" +
    "   vec3 color; \n" +
    "   int shadow; \n" +
    "   float shadowBias; \n" +
    "   float shadowRadius; \n" +
    "   vec2 shadowMapSize; \n" +
    "}; \n" +
    "uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ]; \n" +
    "uniform float textureSize; \n" +

    "varying vec3 vNormal; \n" +
    "varying vec3 vAbsolutePosition; \n" +
    "uniform sampler2D texture; \n" +
    "" +
    "uniform vec3 ambientLightColor; \n" +
    "void main(void) { \n" +
    "   vec2 UV = vec2(vAbsolutePosition.x+0.0, vAbsolutePosition.z)/textureSize; \n" +
    //"   vec2 UV = vec2(0.0, 0.0)/textureSize; \n" +
    "   vec3 colorFinal = texture2D( texture, UV ).xyz;"+
    "   vec3 sumLights = vec3(0.0, 0.0, 0.0); \n" +
    "   DirectionalLight directionalLight;" +
    "   vec3 normal = normalize( vNormal );"+
    "   for(int i = 0; i < NUM_DIR_LIGHTS; i++) {\n" +
    "       directionalLight = directionalLights[ i ]; \n" +
    "       sumLights += dot(directionalLight.direction, normal)* directionalLight.color; \n" +
    "   } \n" +
    "   sumLights = ambientLightColor + max(vec3(0.0,0.0,0.0),sumLights); \n" +
    "   colorFinal *= sumLights; \n" +
    "   if(vAbsolutePosition.y<3.0){ \n" +
    "       colorFinal = mix(vec3(0.1,0.5,0.6), colorFinal, vAbsolutePosition.y/3.0); \n"  +
    "   }" +
    "   gl_FragColor = vec4(colorFinal , 1.0); \n" +
    "}";

const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib['lights'],
    THREE.UniformsLib['ambient']
]);

uniforms.texture = {type: 't', value: null};
uniforms.textureSize = {type: 'f', value: 16};

const mat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertShader,
    fragmentShader: fragShader,
    lights: true
});

module.exports = mat;
