const THREE = require('three');
const material = new THREE.MeshPhongMaterial({
    map:  new THREE.TextureLoader().load('pic/texture_00.jpg'),
    //side: THREE.DoubleSide,
    //color: 0x666666,
    //flatShading: true,
    //emissive: 0x444444,
    shininess: 0,
});
module.exports = material;