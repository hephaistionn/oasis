
const Character = require('../../../kernel/view/character');
const THREE = require('three');
const material = require('../material/materialB');
const materialHead = require('../material/materialA');

const WALK = 0;
const WORK = 1;

animationsBody = {};
animationsHead = {};

animationsBody[WALK] = { duration: 500, steps: new Uint8Array([0, 1, 2, 3, 0]) };
animationsBody[WORK] = { duration: 500, steps: new Uint8Array([0, 2, 0]) };

animationsHead[WALK] = { duration: 500, steps: [new THREE.Vector3(0.059, 1.489, -0.029), new THREE.Vector3(0, 1.377, -0.029), new THREE.Vector3(0.059, 1.482, -0.029), new THREE.Vector3(0, 1.374, -0.029), new THREE.Vector3(0.059, 1.489, -0.029)] };
animationsHead[WORK] = { duration: 500, steps: new Uint8Array([new THREE.Vector3(0.059, 1.489, -0.029), new THREE.Vector3(0, 1.377, -0.029), new THREE.Vector3(0.059, 1.489, -0.029)]) };

module.exports = class Carrier extends Character {

    initMesh(model) {
        this.currentAnimation = WALK;
        this.animationsBody = animationsBody; 
        this.animationsHead = animationsHead;

        this.element = THREE.getMesh('obj/characters/peon.obj', material, model._id);

        this.head = THREE.getMesh('obj/characters/head.obj', materialHead, model._id);

        this.element.add(this.head);
    }
}