
const Character = require('../../../kernel/view/character');
const THREE = require('three');
const material = require('../material/materialMorph');

const WALK = 0;
const WORK = 1;


animationsBodyHunter = {};

animationsBodyHunter[WALK] = { duration: 500, steps: new Uint8Array([0, 1, 2, 3, 0]) };
animationsBodyHunter[WORK] = { duration: 500, steps: new Uint8Array([4, 5, 6]) };


module.exports = class Hunter extends Character {

    initMesh(model) {
        this.currentAnimation = WALK;
        this.animationsBody = animationsBodyHunter; 

        this.element = THREE.getMesh('obj/characters/hunter.obj', material, model._id);
    }

    updateMesh(model) {
        if(model.working) {
            this.currentAnimation = WORK;
        } else  {
            this.currentAnimation = WALK;
        }
    }
}