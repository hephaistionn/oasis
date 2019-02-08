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
        this.meshGazelle1.matrixWorld.elements[13] = model.ay;
        this.meshGazelle2.matrixWorld.elements[13] = model.ay;
        this.meshGazelle3.matrixWorld.elements[13] = model.ay;
        
        this.currentMesh = new THREE.Object3D();
        this.currentMesh.matrixAutoUpdate = false;
        this.meshGazelle1.add(this.currentMesh);
        const matrixWorld = this.currentMesh.matrixWorld.elements;
        matrixWorld[12] = model.ax;
        matrixWorld[13] = model.ay;
        matrixWorld[14] = model.az;  
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
        this.animeEntity(this.meshGazelle1, model.pos1, model.walking1, dt);
        this.animeEntity(this.meshGazelle2, model.pos2, model.walking2, dt);
        this.animeEntity(this.meshGazelle3, model.pos3, model.walking3, dt);
    }

    animeEntity(entity, pos, walk, dt) {
        if (!entity.morphTargetInfluences) return;

        if (walk) {
            const matrixWorld = entity.matrixWorld.elements;
            matrixWorld[12] = pos[0];
            matrixWorld[14] = pos[1];
            matrixWorld[0] = Math.cos(pos[2] - Math.PI / 2);
            matrixWorld[2] = Math.sin(pos[2] - Math.PI / 2);
            matrixWorld[8] = -matrixWorld[2];
            matrixWorld[10] = matrixWorld[0];
            entity.currentAnimation = WALK;
        } else {
            entity.currentAnimation = EAT;
        }


        const animation = this.animations[entity.currentAnimation];
        const steps = animation.steps;
        const duration = animation.duration;
        const nbSteps = steps.length - 1;
        const nbTarget = entity.morphTargetInfluences.length;
        entity.animProgress += dt / duration;
        if (entity.animProgress > 1) {
            entity.animProgress = 0;
            if (entity.currentAnimation === EAT) {
                entity.animProgress = 0;
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
        this.parent.add(mesh);  
    }

    removeMesh(mesh) {
        this.parent.remove(mesh);
        mesh.geometry.dispose();
    }

    remove() {
        this.removeMesh(this.meshGazelle1);
        this.removeMesh(this.meshGazelle2);
        this.removeMesh(this.meshGazelle3);
        this.removeMesh(this.currentMesh);
        this.parent = null;
    }

};
