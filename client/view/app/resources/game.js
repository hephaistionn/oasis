const material = require('../material/materialB');
const THREE = require('three');
const Resource = require('../../../kernel/view/resource');

const WALK = 0;
const EAT = 1;

animationsGazelle = {};
animationsGazelle[WALK] = { duration: 1000, steps: new Uint8Array([0, 1, 2, 3, 0]) };
animationsGazelle[EAT] = { duration: 6000, steps: new Uint8Array([4, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 4]) };

module.exports = class Game extends Resource {

	initMesh(model) {
        this.animations = animationsGazelle;
        this.meshGazelle1 = THREE.getMesh('obj/resources/gazelle_00.obj', material, model._id);
        this.meshGazelle2 = THREE.getMesh('obj/resources/gazelle_00.obj', material, model._id);
        this.meshGazelle3 = THREE.getMesh('obj/resources/gazelle_00.obj', material, model._id);
        this.addMesh(this.meshGazelle1);
        this.addMesh(this.meshGazelle2);
        this.addMesh(this.meshGazelle3);
        this.pos1 = [model.ax,model.az, Math.random() * Math.PI * 2 ];
        this.pos2 = [model.ax,model.az, Math.random() * Math.PI * 2 ];
        this.pos3 = [model.ax,model.az, Math.random() * Math.PI * 2 ];
        this.xmin = model.ax - model.constructor.tileX * model.ground.tileSize;
        this.xmax = model.ax + model.constructor.tileX * model.ground.tileSize;
        this.zmin = model.az - model.constructor.tileZ * model.ground.tileSize;
        this.zmax = model.az + model.constructor.tileZ * model.ground.tileSize;
        this.meshGazelle1.currentAnimation = WALK;
        this.meshGazelle2.currentAnimation = WALK;
        this.meshGazelle3.currentAnimation = WALK;
        this.speed = 0.0015;
		this.updateMesh(model);
	}

	
    updateMesh(model) {
        if (model.selected || this.boxSelector) {
            this.updateMeshSelector(model);
        }
    }


    update(dt, model) {
        this.updateMesh(model);
    }

    playAnimation(dt, model) {
        this.animeEntity(this.meshGazelle1, this.pos1, model, dt);
        this.animeEntity(this.meshGazelle2, this.pos2, model, dt);
        this.animeEntity(this.meshGazelle3, this.pos3, model, dt);
    }

    animeEntity(entity, pos, model, dt){
        if (!entity.morphTargetInfluences || entity.currentAnimation === null) return;

        if(entity.currentAnimation === WALK) {
            if(pos[0]>this.xmax || pos[0] < this.xmin ||  pos[1]>this.zmax || pos[1] < this.zmin) {
                pos[0] -= Math.cos(pos[2]) * this.speed * dt * 2;
                pos[1] -= Math.cos(pos[2]) * this.speed * dt * 2;
                entity.currentAnimation = EAT;
                entity.animProgress = 0;
            }

            pos[0] += Math.cos(pos[2]) * this.speed * dt;
            pos[1] += Math.sin(pos[2]) * this.speed * dt;
            const matrixWorld = entity.matrixWorld.elements;
            matrixWorld[12] = pos[0];
            matrixWorld[13] = model.ay;
            matrixWorld[14] = pos[1];
            matrixWorld[0] = Math.cos(pos[2]-Math.PI/2);
            matrixWorld[2] = Math.sin(pos[2]-Math.PI/2);
            matrixWorld[8] = -matrixWorld[2];
            matrixWorld[10] = matrixWorld[0];
        }

 
        const animation = this.animations[entity.currentAnimation];
        const steps = animation.steps;
        const duration = animation.duration;
        const nbSteps = steps.length - 1;
        const nbTarget = entity.morphTargetInfluences.length;
        entity.animProgress += dt / duration;
        if (entity.animProgress > 1) {
            entity.animProgress = 0;
            if(entity.currentAnimation === EAT) {
                entity.currentAnimation = WALK;
                entity.animProgress = 0;
                pos[2] = pos[2]+(Math.random()*0.2+1)*Math.PI;
                pos[2] = Math.mod2pi(pos[2]);
            }
        }
        const indexStep = Math.min(Math.floor(entity.animProgress * nbSteps), nbSteps - 1);
        for (let i = 0; i < nbTarget; i++) {
            entity.morphTargetInfluences[i] = 0
        }
        const ia = steps[indexStep];
        const ib = steps[indexStep + 1];
        if (ia !== ib) {
            entity.morphTargetInfluences[ib] = entity.animProgress / (1 / nbSteps) - indexStep;
        }
        entity.morphTargetInfluences[ia] = 1 - entity.morphTargetInfluences[ib];
    }

    addMesh(mesh) {
        this.element.add(mesh);
	}
};
