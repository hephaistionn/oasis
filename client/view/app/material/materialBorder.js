const THREE = require('three');

const vertShader = "" +
    "precision highp float; \n" +
    "precision highp int; \n" +
    "uniform mat4 modelMatrix; \n" +
    "uniform mat4 viewMatrix;\n" +
    "uniform mat4 projectionMatrix;\n" +
    "attribute vec3 position; \n" +
    "attribute float color; \n" +
    "varying float vColor; \n" +
    "void main() {" +
    "   vec4 worldPosition = modelMatrix * vec4(position, 1.0 ); \n" +
    "   vColor = color;" +
    "   gl_Position = projectionMatrix * viewMatrix * worldPosition; \n" +
    "} ";


const fragShader = "" +
    "precision highp float; \n" +
    "precision highp int; \n" +
    "varying float vColor; \n" +
    "void main(void) { \n" +
    "   vec3 colorDust = vec3(0.62,0.42,0.3); \n" +
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
const material = new THREE.RawShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertShader,
    fragmentShader: fragShader
});

module.exports = material;