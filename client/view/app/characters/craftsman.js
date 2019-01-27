
const Character = require('../../../kernel/view/character');
const THREE = require('three');
const material = require('../material/materialMorph');
const materialHead = require('../material/materialA');

const WALK = 0;

animationsBody = {};
animationsBody[WALK] = { duration: 500, steps: new Uint8Array([0, 1, 2, 3, 0]) };

module.exports = class Craftsman extends Character {

    initMesh(model) {
        this.currentAnimation = WALK;
        this.animationsBody = animationsBody; 

        this.element = THREE.getMesh('obj/characters/peon.obj', material, model._id);

        this.wood =  THREE.getMesh('obj/resources/wood_00.obj', materialHead, model._id);
        this.wood.matrixWorld = this.element.matrixWorld;
        this.element.add(this.wood);

        this.currentAnimation = WALK;
    }
}