const THREE = require('three');

const vertShader = "" +
    "varying vec3 vNormal; \n" +
    "varying float vType; \n" +
    "varying vec3 vAbsolutePosition; \n" +
    "attribute float type;  \n"+
    "uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHTS ]; \n" +
    "varying vec4 vDirectionalShadowCoord; \n" +
    "void main() { \n" +
    "   vec4 worldPosition = modelMatrix * vec4(position, 1.0 ); \n" +
    "   vType = 1.0;\n"+
    "   if(type < 0.65) { \n"+
    "       vType = 0.5;\n"+
    "   }\n"+
    "   if(type < 0.1) { \n"+
    "       vType = 0.0;\n"+
    "   }\n"+
    "   vAbsolutePosition = worldPosition.xyz; \n" +
    "   vNormal = normalMatrix * normal; \n" +
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


    /*  "float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) { \n" +
    "    shadowCoord.xyz /= shadowCoord.w; \n" +
    "    shadowCoord.z += shadowBias; \n" +
    "    bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 ); \n" +
    "    bool inFrustum = all( inFrustumVec ); \n" +
    "    if ( inFrustum ) { \n" +
    "        return max(texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ),0.5); \n" +
    "    } \n" +
    "    return 1.0; \n" +
    "} \n" + */

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








    "uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ]; \n" +
    "uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHTS ]; \n" +
    "uniform float textureSize; \n" +

    "uniform sampler2D textureGrass; \n"+
    "uniform sampler2D textureDust; \n"+

    "varying vec3 vNormal; \n" +
    "varying float vType; \n" +
    "varying vec3 vAbsolutePosition; \n" +
    "varying vec4 vDirectionalShadowCoord; \n" + 
    "uniform sampler2D texture; \n" +
    "" +
    "void main(void) { \n" +
    "   vec2 UV = vec2(vAbsolutePosition.x, vAbsolutePosition.z)/textureSize; \n" +
    "   vec3 colorFinal= vec3(0.7764,0.6666,0.4235);\n"+
    "   if(vType>0.5) {"+
    "       float inter = smoothstep(0.7,0.8,vType);\n"+
    "           colorFinal =  inter * texture2D( textureGrass, UV ).xyz + (1.0-inter) * texture2D( textureDust, UV ).xyz; \n" +
    "   }"+
    "   vec3 sumLights = vec3(0.0, 0.0, 0.0); \n" +
    "   vec3 normal = normalize( vNormal );"+ 
    "   sumLights += dot(directionalLights[ 0 ].direction, normal)* directionalLights[ 0 ].color; \n" +
    "   float shadowFactor = getShadow( directionalShadowMap[ 0 ], directionalLights[ 0 ].shadowMapSize, directionalLights[ 0 ].shadowBias, directionalLights[ 0 ].shadowRadius, vDirectionalShadowCoord ); \n" +
    "   sumLights *= (shadowFactor*0.2+0.8); \n" +
    //"   sumLights = max(vec3(0.6,0.6,0.6),sumLights); \n" +
    "   colorFinal *= sumLights; \n" +
    "   if(vAbsolutePosition.y<4.0 && vAbsolutePosition.y>3.0){ \n" +
    "       float a = (vAbsolutePosition.y-3.0); \n" +
    "       vec3 borderwater = mix(vec3(0.7,0.7,0.9), colorFinal, 1.0-a);  \n" +
    "       colorFinal = borderwater; \n"  +
    "   }" +
    "   if(vAbsolutePosition.y<4.0){ \n" +
    "       colorFinal = mix(vec3(0.5,0.78,1.0), colorFinal, vAbsolutePosition.y/4.0); \n"  +
    "   }" +
    "   gl_FragColor = vec4(colorFinal , 1.0); \n" +
    "}";

const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib['lights'],
    THREE.UniformsLib['shadowmap']
]);

uniforms.texture = {type: 't', value: null};
uniforms.textureSize = {type: 'f', value: 25.0};
uniforms.textureGrass = {type: 't', value: THREE.loadTexture("pic/map8b.jpg", true)};
uniforms.textureDust = {type: 't', value: THREE.loadTexture("pic/map7g.png", true)};

const mat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertShader,
    fragmentShader: fragShader,
    lights: true
});

module.exports = mat;
