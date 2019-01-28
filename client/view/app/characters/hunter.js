
const Character = require('../../../kernel/view/character');
const THREE = require('three');
const material = require('../material/materialMorph');

const WALK = 0;
const WORK = 1;
const MEAT = 2;

animationsBodyHunter = {};

animationsBodyHunter[WALK] = { duration: 500, steps: new Uint8Array([0, 1, 2, 3, 0]) };
animationsBodyHunter[WORK] = { duration: 500, steps: new Uint8Array([4, 5, 6]) };


module.exports = class Hunter extends Character {

    initMesh(model) {
        this.currentAnimation = WALK;
        this.animationsBody = animationsBodyHunter; 
        this.element = THREE.getMesh('obj/characters/hunter.obj', material, model._id);
        this.meat = null;
    }

    updateMesh(model) {
        if(model.working) {
            this.currentAnimation = WORK;
        }else if (model.stats[MEAT]) {
            this.currentAnimation = WALK;
            if(this.meat) {
                this.meat = THREE.getMesh('obj/resources/meat_00bis.obj', materialHead, model._id);
                this.meat.matrixWorld = this.element.matrixWorld;
                this.element.add(this.meat);
            }
        } else  {
            if(this.meat)
                this.element.remove(this.meat);
            this.currentAnimation = WALK;
        }
    }
}
