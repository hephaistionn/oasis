const THREE = require('../tools/threejs');
const meshSelector = require('./boxSelector').meshSelector;

module.exports = class Member {

    constructor(model, parent) {
        this.currentMesh = null;
        this.boxSelector = null;
        this.matrixWorld = null;
        this.add(parent);
        this.animationsBody = [];
        this.animationsHead = [];
        this.currentAnimation = null;
        this.initMesh(model);
        this.parent.add(this.element);
        this.update(0, model);
    }

    initMesh(model) {

    }

    updateMesh(model) {
        if (model.selected || this.boxSelector) {
            this.updateMeshSelector(model);
        }
    }

    update(dt, model) {
        this.updateMesh(model);
        const matrixWorld = this.element.matrixWorld.elements;
        matrixWorld[12] = model.ax;
        matrixWorld[13] = model.ay;
        matrixWorld[14] = model.az;
        matrixWorld[0] = Math.cos(model.aroty);
        matrixWorld[2] = Math.sin(model.aroty);
        matrixWorld[8] = -matrixWorld[2];
        matrixWorld[10] = matrixWorld[0];
    }

    playAnimation(dt, model) {
        if (!this.element.morphTargetInfluences) return;
        const animation = this.animationsBody[this.currentAnimation];
        const steps = animation.steps;
        const duration = animation.duration;
        const nbSteps = steps.length - 1;
        const nbTarget = this.element.morphTargetInfluences.length;
        this.element.animProgress += dt / duration;
        if (this.element.animProgress > 1) {
            this.element.animProgress = Math.min(this.element.animProgress, 1) - 1;
        }
        const indexStep = Math.min(Math.floor(this.element.animProgress * nbSteps), nbSteps - 1);
        for (let i = 0; i < nbTarget; i++) {
            this.element.morphTargetInfluences[i] = 0
        }
        const ia = steps[indexStep];
        const ib = steps[indexStep + 1];
        if (ia !== ib) {
            this.element.morphTargetInfluences[ib] = this.element.animProgress / (1 / nbSteps) - indexStep;
        }
        this.element.morphTargetInfluences[ia] = 1 - this.element.morphTargetInfluences[ib];

        if (this.head) {
            const animationHead = this.animationsHead[this.currentAnimation];
            const stepsHead = animationHead.steps;
            const v1 = stepsHead[indexStep];
            const v2 = stepsHead[indexStep + 1];
            const b = this.element.morphTargetInfluences[ib];
            const a = this.element.morphTargetInfluences[ia];
            const x = v1.x * a + v2.x * b;
            const y = v1.y * a + v2.y * b;
            const z = v1.z * a + v2.z * b;
            const matrixWorld = this.head.matrixWorld.elements;
            matrixWorld[12] = x + model.ax;
            matrixWorld[13] = y + model.ay;
            matrixWorld[14] = z + model.az;
            matrixWorld[0] = Math.cos(model.aroty);
            matrixWorld[2] = Math.sin(model.aroty);
            matrixWorld[8] = -matrixWorld[2];
            matrixWorld[10] = matrixWorld[0];
        }
    }

    updateMeshSelector(model) {
        if (model.selected && !this.boxSelector) {
            this.boxSelector = meshSelector;
            const Class = model.constructor;
            const size = model.ground.tileSize / 2;
            this.boxSelector.box.setFromArray([ size/2, size, size/2, -size/2, 0, -size/2]);
            this.boxSelector.updateMatrixWorld();
            this.element.add(this.boxSelector);
        } else if (!model.selected && this.boxSelector) {
            this.element.remove(this.boxSelector);
            this.boxSelector = null;
        }
    }

    remove() {
        this.parent.remove(this.element);
        this.parent = null;
    }

    add(parent) {
        this.parent = parent;
    }
};
