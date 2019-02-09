const material = require('../../app/material/materialA');
const materialSelect = require('../../app/material/materialSelect');
const THREE = require('three');
const Building = require('../../../kernel/view/building');
const Stats = require('../../../kernel/model/stats');


const obj = {};
obj[Stats.WOOD] = [
	'obj/resources/wood_00.obj',
	'obj/resources/wood_01.obj',
	'obj/resources/wood_02.obj',
	'obj/resources/wood_03.obj'
];

obj[Stats.STONE] = [
	'obj/resources/stone_00.obj',
	'obj/resources/stone_01.obj',
	'obj/resources/stone_02.obj',
	'obj/resources/stone_03.obj'
];

obj[Stats.MEAT] = [
	'obj/resources/meat_00.obj',
	'obj/resources/meat_01.obj',
	'obj/resources/meat_02.obj',
	'obj/resources/meat_03.obj'
];

const blockPosX = [
	3, 1, -1, -3,
	3, 1, -1, -3,
	3, 1, -1, -3,
	1, -1, -3
];

const blockPosZ = [
	3, 3, 3, 3,
	1, 1, 1, 1,
	-1, -1, -1, -1,
	-3, -3, -3
];

module.exports = class Repository extends Building {

	initMesh(model) {
		this.meshLevel.push(THREE.getMesh('obj/buildings/foundation_00.obj', material, model._id));
		this.meshLevel.push(THREE.getMesh('obj/buildings/repository_00.obj', material, model._id));
		this.draft = THREE.getMesh('obj/buildings/repository_00.obj', materialSelect);
		this.resources = [];
		this.blockTypeCount = new Map();
		this.indexblock = 0;
	}

	update(dt, model) {
		this.updateMesh(model);
		if (!model.drafted)
			this.updateResources(model);
		const matrixWorld = this.matrixWorld.elements;
		matrixWorld[12] = model.ax;
		matrixWorld[14] = model.az;
		matrixWorld[13] = model.ay;
	}

	updateResources(model) {
		let i;
		for (i = 0; i < this.resources.length; i++) {
			if (this.resources[i]) {
				this.currentMesh.remove(this.resources[i]);
				this.resources[i] = null;
			}
		}

		for (let key of this.blockTypeCount.keys()) {
			this.blockTypeCount.set(key, 1);
		}

		let count, type, rest, matrixWorld;
		for (i = 0; i < model.maxBlock; i++) {
			type = model.blocksType[i];

			if (type === 0) { // block vide
				continue;
			}

			count = this.blockTypeCount.get(type)||1;
			if ( model.stats[type] / (count * model.maxByBlock) < 1) { // block non plein
				rest = model.stats[type] % model.maxByBlock;
				if (rest > 8) {
					this.resources[i] = THREE.getMesh(obj[type][2], material);
				} else if (rest > 4) {
					this.resources[i] = THREE.getMesh(obj[type][1], material);
				} else if (rest > 0) {
					this.resources[i] = THREE.getMesh(obj[type][0], material);
				}
			} else { // block plein
				this.resources[i] = THREE.getMesh(obj[type][3], material);
			}

			matrixWorld = this.resources[i].matrixWorld.elements;
			matrixWorld[12] = blockPosX[i] + model.ax;
			matrixWorld[14] = blockPosZ[i] + model.az;
			matrixWorld[13] = 0.5 + model.ay;
			this.currentMesh.add(this.resources[i]);

			this.blockTypeCount.set(type, count+1);

		}
	}

};