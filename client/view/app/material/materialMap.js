const THREE = require('three');

const vertShader = "" +
    "varying vec3 vecNormal; \n" +
    "varying vec3 vAbsolutePosition; \n" +
    "uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHTS ]; \n" +
    "varying vec4 vDirectionalShadowCoord; \n" +
    "void main() { \n" +
    "vec4 worldPosition = modelMatrix * vec4(position, 1.0 ); \n" +
    "vAbsolutePosition = worldPosition.xyz; \n" +
    "vecNormal = (modelMatrix * vec4(normal, 0.0)).xyz; \n" +
    "vDirectionalShadowCoord = directionalShadowMatrix[ 0 ] * worldPosition; \n" +
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
    "uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHTS ]; \n" +
    "uniform float textureSize; \n" +
    "varying vec4 vDirectionalShadowCoord; \n" +
    "float unpackDepth( const in vec4 rgba_depth ) { \n" +
    "    const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 ); \n" +
    "    return dot( rgba_depth, bit_shift ); \n" +
    "} \n" +
    "float texture2DCompare( sampler2D depths, vec2 uv, float compare ) { \n" +
    "    return step( compare, unpackDepth( texture2D( depths, uv ) ) ); \n" +
    "} \n" +
    "float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) { \n" +
    "    shadowCoord.xyz /= shadowCoord.w; \n" +
    "    shadowCoord.z += shadowBias; \n" +
    "    bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 ); \n" +
    "    bool inFrustum = all( inFrustumVec ); \n" +
    "    if ( inFrustum ) { \n" +
    "        return max(texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ),0.5); \n" +
    "    } \n" +
    "    return 1.0; \n" +
    "} \n" +

    "varying vec3 vecNormal; \n" +
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
    "   for(int i = 0; i < NUM_DIR_LIGHTS; i++) {\n" +
    "       directionalLight = directionalLights[ i ]; \n" +
    "       sumLights += dot(directionalLight.direction, vecNormal)* directionalLight.color; \n" +
    "           float shadowFactor = bool( directionalLight.shadow ) ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord ) : 1.0; \n" +
    "           sumLights *= shadowFactor; \n" +
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
