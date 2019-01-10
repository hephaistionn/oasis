const material = require('../../app/material/materialA');
const materialSelect = require('../../app/material/materialSelect');
const THREE = require('three');
const Building = require('../../../kernel/view/Building');

module.exports = class LeaderHut extends Building {

	initMesh(model) {
		this.meshLevel.push(THREE.getMesh('obj/buildings/repository_00.obj', material, model._id));
		this.meshLevel.push(THREE.getMesh('obj/buildings/leaderHut_00.obj', material, model._id));
		this.draft = THREE.getMesh('obj/buildings/leaderHut_00.obj', materialSelect);
	}
};