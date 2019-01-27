const material = require('../material/materialB');
const THREE = require('three');
const Resource = require('../../../kernel/view/resource');

const WALK = 0;

animationsGazelle = {};
animationsGazelle[WALK] = { duration: 500, steps: new Uint8Array([0, 1, 2, 3, 0]) };

module.exports = class Game extends Resource {

	initMesh(model) {
		this.currentAnimation = WALK;
        this.animations = animationsGazelle; 
		this.meshGazelle = THREE.getMesh('obj/resources/gazelle_00.obj', material, model._id);
		this.addMesh(this.meshGazelle);
		this.updateMesh(model);
	}

	
    updateMesh(model) {
        if (model.selected || this.boxSelector) {
            this.updateMeshSelector(model);
        }
    }

    addMesh(mesh) {
        this.element.add(mesh);
        mesh.matrixWorld.copy(this.element.matrixWorld); 
	}

    update(dt, model) {
        this.updateMesh(model);
        const matrixWorld = this.meshGazelle.matrixWorld.elements;
        matrixWorld[12] = model.ax;
        matrixWorld[13] = model.ay;
        matrixWorld[14] = model.az;
        matrixWorld[0] = Math.cos(model.aroty);
        matrixWorld[2] = Math.sin(model.aroty);
        matrixWorld[8] = -matrixWorld[2];
        matrixWorld[10] = matrixWorld[0];
    }

	
    playAnimation(dt, model) {
        if (!this.meshGazelle.morphTargetInfluences) return;
        const animation = this.animations[this.currentAnimation];
        const steps = animation.steps;
        const duration = animation.duration;
        const nbSteps = steps.length - 1;
        const nbTarget = this.meshGazelle.morphTargetInfluences.length;
        this.meshGazelle.animProgress += dt / duration;
        if (this.meshGazelle.animProgress > 1) {
            this.meshGazelle.animProgress = Math.min(this.meshGazelle.animProgress, 1) - 1;
        }
        const indexStep = Math.min(Math.floor(this.meshGazelle.animProgress * nbSteps), nbSteps - 1);
        for (let i = 0; i < nbTarget; i++) {
            this.meshGazelle.morphTargetInfluences[i] = 0
        }
        const ia = steps[indexStep];
        const ib = steps[indexStep + 1];
        if (ia !== ib) {
            this.meshGazelle.morphTargetInfluences[ib] = this.meshGazelle.animProgress / (1 / nbSteps) - indexStep;
        }
        this.meshGazelle.morphTargetInfluences[ia] = 1 - this.meshGazelle.morphTargetInfluences[ib];

        if (this.head) {
            const animationHead = this.animationsHead[this.currentAnimation];
            const stepsHead = animationHead.steps;
            const v1 = stepsHead[indexStep];
            const v2 = stepsHead[indexStep + 1];
            const b = this.meshGazelle.morphTargetInfluences[ib];
            const a = this.meshGazelle.morphTargetInfluences[ia];
            const x = v1.x * a + v2.x * b;
            const y = v1.y * a + v2.y * b;
            const z = v1.z * a + v2.z * b;
            const matrixWorld = this.head.matrixWorld.meshGazelle;
            matrixWorld[12] = x + model.ax;
            matrixWorld[13] = y + model.ay;
            matrixWorld[14] = z + model.az;
            matrixWorld[0] = Math.cos(model.aroty);
            matrixWorld[2] = Math.sin(model.aroty);
            matrixWorld[8] = -matrixWorld[2];
            matrixWorld[10] = matrixWorld[0];
        }
    }

};
