const material = require('../../app/material/materialA');
const materialSelect = require('../../app/material/materialSelect');
const THREE = require('three');
const Building = require('../../../kernel/view/building');

module.exports = class WallBlock extends Building {

	initMesh(model) {

		this.wallLevel = {};

		this.wallLevel[1] = [
			THREE.getMesh('obj/buildings/wallA_00.obj', material, model._id),
			THREE.getMesh('obj/buildings/wallB_00.obj', material, model._id),
			THREE.getMesh('obj/buildings/wallC_00.obj', material, model._id),
			THREE.getMesh('obj/buildings/wallD_00.obj', material, model._id)
		];

		this.wallLevel[2] = [
			THREE.getMesh('obj/buildings/wallA_00.obj', material, model._id),
			THREE.getMesh('obj/buildings/wallB_00.obj', material, model._id),
			THREE.getMesh('obj/buildings/wallC_00.obj', material, model._id),
			THREE.getMesh('obj/buildings/wallD_00.obj', material, model._id)
		];

	}

	updateMesh(model) {
		if (this.level !== model.level) {
			this.removeMesh(this.meshWall);
			this.meshWall = this.wallLevel[model.level][model.shape];
			this.addMesh(this.meshWall);
			this.meshLevel[model.level] = this.meshWall; // obligation pour le bon fonctionnement de updateMeshSelector. Ce composant n'est pas un Building stantard
		}
		this.updateMeshSelector(model);
	}

};