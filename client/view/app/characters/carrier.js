
const Character = require('../../../kernel/view/character');
const THREE = require('three');
const material = require('../material/materialMorph');
const materialHead = require('../material/materialA');

const animations = {
    walk: { duration: 2000, steps: new Uint8Array([0, 1, 2, 3, 0]) },
    work: { duration: 500, steps: new Uint8Array([0, 2, 0]) }
};

const animationsHead = {
    walk: { duration: 2000, steps: [new THREE.Vector3(0.059, 1.489, -0.029), new THREE.Vector3(0, 1.377, -0.029), new THREE.Vector3(0.059, 1.482, -0.029), new THREE.Vector3(0, 1.374, -0.029), new THREE.Vector3(0.059, 1.489, -0.029)] },
    work: { duration: 500, steps: new Uint8Array([new THREE.Vector3(0.059, 1.489, -0.029), new THREE.Vector3(0, 1.377, -0.029), new THREE.Vector3(0.059, 1.489, -0.029)]) }
};

module.exports = class builder extends Character {

    initBody(model) {
        this.element = THREE.getMesh('obj/peon.obj', material, model._id);
        this.currentAnimation = 'walk';
        this.animations = animations;
    }

    initHead(model) {
        this.animationsHead = animationsHead;
        this.head = THREE.getMesh('obj/head.obj', materialHead, model._id);
        this.head.matrixAutoUpdate = true;
        this.head.position.set(0.059, 1.489, -0.029);
        this.element.add(this.head);
    }
}