const THREE = require('three');
const material = new THREE.MeshPhongMaterial({
    map: THREE.ImageUtils.loadTexture('pic/entity.png'),
    //side: THREE.DoubleSide,
    color: 0x666666,
    shininess: 0,
});
module.exports = material;