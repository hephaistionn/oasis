const material = require('../../app/material/materialA');
const materialSelect = require('../../app/material/materialSelect');
const THREE = require('three');
const Building = require('../../../kernel/view/building');

module.exports = class WallBlock extends Building {

	initMesh(model) {
		this.updateMesh(model);
	}

	updateMesh(model) {
		if (this.building) {
			this.removeMesh(this.building);
		}
		switch (model.shape) {
			case 0:
				this.building = THREE.getMesh('obj/buildings/wallA_00.obj', material, model._id);
				break;
			case 1:
				this.building = THREE.getMesh('obj/buildings/wallB_00.obj', material, model._id);
				break;
			case 2:
				this.building = THREE.getMesh('obj/buildings/wallC_00.obj', material, model._id);
				break;
			default:
				this.building = THREE.getMesh('obj/buildings/wallD_00.obj', material, model._id);
		}
		this.addMesh(this.building);

		if (model.selected && !this.boxSelector) {
			this.boxSelector = new THREE.BoxHelper(this.building, 0xffff00);
			this.boxSelector.matrixAutoUpdate = false;
			this.element.add(this.boxSelector);
		} else if (!model.selected && this.boxSelector) {
			this.element.remove(this.boxSelector);
			this.boxSelector = null;
		}
	}

};