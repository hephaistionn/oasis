const material = require('../../app/material/materialA');
const materialSelect = require('../../app/material/materialSelect');
const THREE = require('three');
const Building = require('../../../kernel/view/building');

module.exports = class Bridge extends Building {

    initMesh(model) {
    	this.building = THREE.getMesh('obj/buildings/bridge.obj', material, model._id);
		this.foundation = THREE.getMesh('obj/buildings/repository_00.obj', material, model._id);
		this.draft = THREE.getMesh('obj/buildings/bridge.obj', materialSelect);
    	this.updateMesh(model);	
	}
	
};