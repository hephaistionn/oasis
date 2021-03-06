const material = require('../material/materialA');
const THREE = require('three');
const Resource = require('../../../kernel/view/resource');

module.exports = class Tree extends Resource {

	initMesh(model) {
		this.meshFull = THREE.getMesh(`obj/resources/tree_0${model.num}.obj`, material, model._id);
		this.meshSoldout = THREE.getMesh('obj/resources/trunk_00.obj', material, model._id);
	}

};
