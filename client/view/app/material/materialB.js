const THREE = require('three');
const material = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load('pic/unity.png'), morphTargets: true });
module.exports = material;