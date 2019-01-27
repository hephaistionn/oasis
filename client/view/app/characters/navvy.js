const Character = require('../../../kernel/view/character');
const THREE = require('three');
const material = require('../material/materialMorph');
const materialHead = require('../material/materialA');

const WALK = 0;
const WORK = 1;

animationsBodyNavvy = {};
animationsBodyNavvy[WALK] = { duration: 500, steps: new Uint8Array([0, 1, 2, 3, 0]) };
animationsBodyNavvy[WORK] = { duration: 500, steps: new Uint8Array([0, 1, 0]) };

module.exports = class Navvy extends Character {

    initMesh(model) {
        this.currentAnimation = WALK;
        this.animationsBody = animationsBodyNavvy; 

        this.element = THREE.getMesh('obj/characters/peon.obj', material, model._id);

        this.wood =  THREE.getMesh('obj/resources/wood_00.obj', materialHead, model._id);
        this.wood.matrixWorld = this.element.matrixWorld;
        this.element.add(this.wood);
        this.currentAnimation = WALK;
    }

    updateMesh(model) {
      if(model.working) {
          this.currentAnimation = WORK;
      } else  {
          this.currentAnimation = WALK;
      }
  }
}