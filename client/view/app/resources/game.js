const material = require('../material/materialA');
const THREE = require('three');
const Resource = require('../../../kernel/view/resource');

module.exports = class Game extends Resource {

	initMesh(model) {
		this.meshFull = THREE.getMesh('obj/resources/berry_00.obj', material, model._id);
		this.meshSoldout = THREE.getMesh('obj/resources/trunk.obj', material, model._id);
		this.updateMesh(model);
	}

};
