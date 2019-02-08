const THREE = require('three');

const boxSelect = new THREE.Box3(new THREE.Vector3(0,0,0), new THREE.Vector3(1,1,1));
const meshSelector = new THREE.Box3Helper(boxSelect, 0xffff00);
//meshSelector.matrixAutoUpdate = false;


const boxfocus = new THREE.Box3(new THREE.Vector3(0,0,0), new THREE.Vector3(1,1,1));
const meshFocus = new THREE.Box3Helper(boxfocus, 0x555555);
//meshFocus.matrixAutoUpdate = false;

module.exports.meshSelector = meshSelector;
module.exports.meshFocus = meshFocus;