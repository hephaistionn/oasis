const THREE = require('three');

const vertShader = "" +
    "attribute float color; \n" +
    "varying vec2 vAbsolutePosition; \n" +
    "varying float vColor; \n" +
    "void main() { \n" +
    "vec4 worldPosition = modelMatrix * vec4(position, 1.0 ); \n" +
    "vAbsolutePosition = worldPosition.xz; \n" +
    "vColor = color;" +
    "gl_Position = projectionMatrix * viewMatrix * worldPosition; \n" +
    "} ";


const fragShader = "" +
    "varying vec2 vAbsolutePosition; \n" +
    "varying float vColor; \n" +
    "" + 
    "uniform sampler2D texture; \n" +
    "uniform float textureSize; \n" +
    "void main(void) { \n" +
    "   vec3 colorDust = vec3(0.42,0.42,0.48); \n" +
    //"   vec3 colorDust = vec3(0.0,0.0,0.0); \n" +
    "   vec3 colorGreen = vec3(0.7764,0.6666,0.4235); \n" +
    "   if(vColor>0.0) {   \n" +
    "       if(vColor>0.99){ \n"+
    "           gl_FragColor.xyz = colorDust*0.7; \n"  +
    "       }else{ \n" +
    "           gl_FragColor.xyz = colorGreen*0.7; \n" +
    "       } \n" +
    "   }else{ \n" +
    "       if(vColor<-0.99){ \n"+
    "           gl_FragColor.xyz = colorDust*0.85; \n" +
    "       }else{" +
    "           gl_FragColor.xyz = colorGreen*0.85; \n" +
    "       }" +
    "   }" +
    "}";

const uniforms = THREE.UniformsUtils.merge([]);
uniforms.texture = {type: 't', value: null};
uniforms.textureSize = {type: 'f', value: 16};

const mat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertShader,
    fragmentShader: fragShader
});

module.exports = mat;
