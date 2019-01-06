const material = require('../../app/material/materialA');
const materialSelect = require('../../app/material/materialSelect');
const THREE = require('three');
const Building = require('../../../kernel/view/building');

module.exports = class Tower extends Building {

	initMesh(model) {
		this.building = THREE.getMesh('obj/buildings/attic_00.obj', material, model._id);
		this.foundation = THREE.getMesh('obj/buildings/repository_00.obj', material, model._id);
		this.draft = THREE.getMesh('obj/buildings/attic_00.obj', materialSelect);
		this.animatedMesh = THREE.getMesh('obj/buildings/bullet.obj', material, model._id);
		this.element.add(this.animatedMesh);
		this.animProgress = 0;
		this.animDuration = model.shootDuration;
		this.updateMesh(model);
	}

	playAnimation(dt, model) {
		if (model.shooting) {
			this.animatedMesh.visible = true;
		} else {
			this.animatedMesh.visible = false;
			this.animProgress = 0;
			return;
		}

		this.animProgress += dt / this.animDuration;

		if (this.animProgress > 1) {
			this.animProgress = 0;
		}

		const matrixWorld = this.animatedMesh.matrixWorld.elements;
		matrixWorld[12] = model.ax + this.animProgress * model.targetDx;
		matrixWorld[13] = model.weaponHeight + this.animProgress * model.targetDy;
		matrixWorld[14] = model.az + this.animProgress * model.targetDz;

		matrixWorld[0] = Math.cos(model.weaponDirectionY);
		matrixWorld[2] = Math.sin(model.weaponDirectionY);
		matrixWorld[8] = -matrixWorld[2];
		matrixWorld[10] = matrixWorld[0];
	}

};