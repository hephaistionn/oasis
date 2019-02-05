const THREE = require('three');

const vertShader = "" +
    "attribute float type; \n" +
    "varying vec3 vAbsolutePosition; \n" +
    "varying vec2 vUv; \n" +
    "varying vec3 vNormal; \n" +
    "varying float vType; \n" +
    "varying vec4 vDirectionalShadowCoord; \n" +
    "uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHTS ]; \n" +
    "void main() { \n" +
    "   vec4 worldPosition = modelMatrix * vec4(position, 1.0 ); \n" +
    "   vAbsolutePosition = worldPosition.xyz; \n" +
    "   vNormal = normalMatrix * normal; \n" +
    "   vUv = uv; \n" +
    "   vType = type; \n" +
    "   vDirectionalShadowCoord = directionalShadowMatrix[ 0 ] * worldPosition; \n" +
    "   gl_Position = projectionMatrix * viewMatrix * worldPosition; \n" +
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
    "float unpackDepth( const in vec4 rgba_depth ) { \n" +
    "    const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 ); \n" +
    "    return dot( rgba_depth, bit_shift ); \n" +
    "} \n" +
    "float texture2DCompare( sampler2D depths, vec2 uv, float compare ) { \n" +
    "    return step( compare, unpackDepth( texture2D( depths, uv ) ) ); \n" +
    "} \n" +

    "float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) { \n" +
    "	float shadow = 1.0;\n" +
    "	shadowCoord.xyz /= shadowCoord.w;\n" +
    "	shadowCoord.z += shadowBias;\n" +
    "	bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );\n" +
    "	bool inFrustum = all( inFrustumVec );\n" +
    "	bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );\n" +
    "	bool frustumTest = all( frustumTestVec );\n" +
    "	if ( frustumTest ) {\n" +
    "		vec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n" +
    "		float dx0 = - texelSize.x * shadowRadius;\n" +
    "		float dy0 = - texelSize.y * shadowRadius;\n" +
    "		float dx1 = + texelSize.x * shadowRadius;\n" +
    "		float dy1 = + texelSize.y * shadowRadius;\n" +
    "		shadow = (\n" +
    "			texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +\n" +
    "			texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +\n" +
    "			texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +\n" +
    "			texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +\n" +
    "			texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +\n" +
    "			texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +\n" +
    "			texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +\n" +
    "			texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +\n" +
    "			texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )\n" +
    "		) * ( 1.0 / 9.0 );\n" +
    "	}\n" +
    "	return shadow;\n" +
    "}\n" +

    "varying vec2 vUv; \n" +
    "varying vec3 vNormal; \n" +
    "varying vec3 vAbsolutePosition; \n" +
    "varying vec4 vDirectionalShadowCoord; \n" + 
    "varying float vType; \n" +
    "uniform sampler2D textureLayout; \n" +
    "uniform sampler2D textureDust; \n"+
    "uniform float textureSize; \n" +
    "uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ]; \n" +
    "uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHTS ]; \n" +
    "" +
    "void main(void) { \n" +
    "" +
    "   vec2 UVT = vec2(vAbsolutePosition.x, vAbsolutePosition.z)/10.0; \n" +
    "   vec2 UV = vec2(vAbsolutePosition.x, vAbsolutePosition.z)/textureSize; \n" +
    "   vec3 filter = texture2D( textureLayout, vUv ).xyz; \n" +
    "   vec3 colorFinal = texture2D( textureDust, UV ).xyz; \n" +
    "   if(vType>2.5){ \n"+
    "       colorFinal = vec3(0.0, 0.0, 1.0); \n" +
    "   }" +
    //"colorFinal *= (sin(vAbsolutePosition.x*2.0)*0.04+1.0 + cos(vAbsolutePosition.z*2.0)*0.04);"+ 
    "   vec3 sumLights = vec3(0.0, 0.0, 0.0); \n" +
    "   " +
    "   sumLights += dot(directionalLights[ 0 ].direction, vNormal)* directionalLights[ 0 ].color; \n" +
    "   float shadowFactor = getShadow( directionalShadowMap[ 0 ], directionalLights[ 0 ].shadowMapSize, directionalLights[ 0 ].shadowBias, directionalLights[ 0 ].shadowRadius, vDirectionalShadowCoord ); \n" +
    "   sumLights *= shadowFactor; \n" +
    "   sumLights *= (shadowFactor*0.2+0.8); \n" +
    "   colorFinal *= sumLights; \n" +
    "   gl_FragColor = vec4(colorFinal , min(filter.x, 1.0)); \n" +
    "} ";

const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib['lights'],
    THREE.UniformsLib['shadowmap']
]);

uniforms.textureLayout = {type: 't', value: THREE.loadTexture("pic/path_opacity_3.png")};
uniforms.textureDust = {type: 't', value: THREE.loadTexture("pic/map7g.png")};
uniforms.textureLayout.value.flipY = false;
uniforms.textureLayout.value.minFilter = THREE.NearestFilter;
uniforms.textureLayout.value.repeat = false;
uniforms.textureLayout.value.generateMipmaps = false;
uniforms.textureSize = {type: 'f', value: 25.0};

const mat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertShader,
    fragmentShader: fragShader,
    lights: true,
    transparent: true
});

module.exports = mat;
