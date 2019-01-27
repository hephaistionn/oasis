const THREE = require('three');
const material = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load('pic/texture_00.jpg'), morphTargets: true, shininess: 0, });
module.exports = material;