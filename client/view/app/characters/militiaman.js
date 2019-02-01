
const Character = require('../../../kernel/view/character');
const THREE = require('three');
const material = require('../material/materialB');

const WALK = 0;
const WORK = 1;
const WAIT = 2;

animationsBodySolier = {};

animationsBodySolier[WALK] = { duration: 500, steps: new Uint8Array([0, 1, 2, 3, 0]) };
animationsBodySolier[WORK] = { duration: 500, steps: new Uint8Array([4, 5, 6]) };
animationsBodySolier[WAIT] = { duration: 500, steps: new Uint8Array([0, 0, 0]) };


module.exports = class Militiaman extends Character {

    initMesh(model) {
        this.currentAnimation = WALK;
        this.animationsBody = animationsBodySolier; 
        this.element = THREE.getMesh('obj/characters/hunter.obj', material, model._id);
    }

    updateMesh(model) {
        if(model.fighting) {
            this.currentAnimation = WORK;
        } else if ( model.path === null) {
            this.currentAnimation = WAIT;
        } else  {
            this.currentAnimation = WALK;
        }
    }
}