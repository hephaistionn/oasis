const THREE = require('three');

const vertShader = "" +
    "varying vec3 vNormal; \n" +
    //"varying vec3 vColor; \n" +
    "varying float vType; \n" +
    "varying vec3 vAbsolutePosition; \n" +
    //"attribute vec3 color;  \n"+
    "attribute float type;  \n"+
    "void main() { \n" +
    "vec4 worldPosition = modelMatrix * vec4(position, 1.0 ); \n" +
    //"vColor = color.xyz; \n" +

    //"vColor =  vec3(0.0, 0.5, 0.0);\n"+
    ///"if(type < 0.65) { \n"+
    //"   vColor = vec3(0.5, 0.5, 0.2);\n"+
    //"}\n"+

    "vType = 1.0;\n"+
    "if(type < 0.65) { \n"+
    "   vType = 0.5;\n"+
    "}\n"+
    "if(type < 0.1) { \n"+
    "   vType = 0.0;\n"+
    "}\n"+

    //"vType = type; \n" +
    //"vColor = vec3(0.0, 0.0, 1.0); \n" +
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

    "uniform sampler2D textureGrass; \n"+
    "uniform sampler2D textureDust; \n"+

    "varying vec3 vNormal; \n" +
    //"varying vec3 vColor; \n" +
    "varying float vType; \n" +
    "varying vec3 vAbsolutePosition; \n" +
    "uniform sampler2D texture; \n" +
    "" +
    "void main(void) { \n" +
    "vec2 UV = vec2(vAbsolutePosition.x, vAbsolutePosition.z)/textureSize; \n" +
    //"   vec2 UV = vec2(0.0, 0.0)/textureSize; \n" +
    //"   vec3 colorFinal = texture2D( texture, UV ).xyz;"+
    //"   vec3 colorFinal = vColor.xyz; \n"+


    /*"vec3 colorFinal =  texture2D( textureGrass, UV ).xyz;\n"+
    "if(vType < 0.5) { \n"+
    "   colorFinal = texture2D( textureDust, UV ).xyz;\n"+
    "}\n"+
    */

    /*
    "vec3 colorFinal = vec3(0.0, 0.0, 0.0);\n"+
    "if(vType < 0.6 && vType > 0.4) { \n"+
    "   colorFinal +=  vType * texture2D( textureGrass, UV ).xyz + (1.0-vType) * texture2D( textureDust, UV ).xyz; \n" +
    "}\n"+
    "if(vType <= 0.4) { \n"+
    "   colorFinal += texture2D( textureDust, UV ).xyz;\n"+
    "}\n"+
    "if(vType >= 0.6) { \n"+
    "   colorFinal += texture2D( textureGrass, UV ).xyz;\n"+
    "}\n"+
    */

    "vec3 colorFinal= vec3(0.7764,0.6666,0.4235);\n"+
    
    "if(vType>0.5) {"+
    "float inter = smoothstep(0.7,0.8,vType);\n"+
    "colorFinal =  inter * texture2D( textureGrass, UV ).xyz + (1.0-inter) * texture2D( textureDust, UV ).xyz; \n" +
    "}"+

    /*"if(vType < 0.6 && vType > 0.5) { \n"+
    "   colorFinal = (vec3(0.52, 0.662, 0.278)+colorFinal)/vec3(2.0, 2.0, 2.0);; \n" +
    "}\n"+*/

    //"vec3 colorFinal =  vType * texture2D( textureGrass, UV ).xyz + (1.0-vType) * texture2D( textureDust, UV ).xyz; \n" +


    "   vec3 sumLights = vec3(0.0, 0.0, 0.0); \n" +
    "   DirectionalLight directionalLight;" +
    "   vec3 normal = normalize( vNormal );"+ 
    "   for(int i = 0; i < NUM_DIR_LIGHTS; i++) {\n" +
    "       directionalLight = directionalLights[ i ]; \n" +
    "       sumLights += dot(directionalLight.direction, normal)* directionalLight.color; \n" +
    "   } \n" +
    "   sumLights = max(vec3(0.6,0.6,0.6),sumLights); \n" +
    "   colorFinal *= sumLights; \n" +
    "   if(vAbsolutePosition.y<4.0 && vAbsolutePosition.y>3.0){ \n" +
    "        float a = (vAbsolutePosition.y-3.0); \n" +
    "       vec3 borderwater = mix(vec3(0.7,0.7,0.9), colorFinal, 1.0-a);  \n" +
    //"       colorFinal = (borderwater + borderwater)/2.0; \n"  +
    "       colorFinal = borderwater; \n"  +
    "   }" +
    "   if(vAbsolutePosition.y<4.0){ \n" +
    "       colorFinal = mix(vec3(0.5,0.78,1.0), colorFinal, vAbsolutePosition.y/4.0); \n"  +
    "   }" +
    "   gl_FragColor = vec4(colorFinal , 1.0); \n" +
    "}";

const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib['lights']
]);

uniforms.texture = {type: 't', value: null};
uniforms.textureSize = {type: 'f', value: 25.0};
uniforms.textureGrass = {type: 't', value: THREE.loadTexture("pic/map8b.jpg")};
uniforms.textureDust = {type: 't', value: THREE.loadTexture("pic/map7g.png")};

const mat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertShader,
    fragmentShader: fragShader,
    lights: true
});

module.exports = mat;
