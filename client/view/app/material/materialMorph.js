const THREE = require('three');
const material = new THREE.MeshPhongMaterial({
    //map: new THREE.TextureLoader().load('pic/map_theme01.png'),
    color: 0x555555,
    shininess: 0,
    emissive: 0x111111, //changer la couleur en fonction du path en cours
    //emissiveMap : new THREE.TextureLoader().load('pic/lightingmap.jpg'),
    morphTargets: true
});
module.exports = material;