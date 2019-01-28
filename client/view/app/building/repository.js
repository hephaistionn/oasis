const material = require('../../app/material/materialA');
const materialSelect = require('../../app/material/materialSelect');
const THREE = require('three');
const Building = require('../../../kernel/view/building');
const Stats = require('../../../kernel/model/stats');


const obj = {};
obj[Stats.WOOD] =  [
	'obj/resources/wood_00.obj',
	'obj/resources/wood_01.obj',
	'obj/resources/wood_02.obj',
	'obj/resources/wood_03.obj'
];

obj[Stats.STONE] =  [
	'obj/resources/stone_00.obj',
	'obj/resources/stone_01.obj',
	'obj/resources/stone_02.obj',
	'obj/resources/stone_03.obj'
];

obj[Stats.MEAT] =  [
	'obj/resources/meat_00.obj',
	'obj/resources/meat_01.obj',
	'obj/resources/meat_02.obj',
	'obj/resources/meat_03.obj'
];

const blockPos = [
	3,3, 1,3, -1,3, -3,3,
	3,1, 1,1, -1,1, -3,1,
	3,-1, 1,-1, -1,-1, -3,-1,
	1,-3, -1,-3, -3,-3
];

module.exports = class Repository extends Building {

	initMesh(model) {
		this.meshLevel.push(THREE.getMesh('obj/buildings/foundation_00.obj', material, model._id));
		this.meshLevel.push(THREE.getMesh('obj/buildings/repository_00.obj', material, model._id));
		this.draft = THREE.getMesh('obj/buildings/repository_00.obj', materialSelect);
		this.resources = [];
		this.indexblock = 0;
	}

	update(dt, model) {
		this.updateMesh(model);
		if(!model.drafted)
			this.updateResources(model);
        const matrixWorld = this.element.matrixWorld.elements;
        matrixWorld[12] = model.ax;
        matrixWorld[14] = model.az;
        matrixWorld[13] = model.ay;
        matrixWorld[0] = Math.cos(model.aroty);
        matrixWorld[2] = Math.sin(model.aroty);
        matrixWorld[8] = -matrixWorld[2];
        matrixWorld[10] = matrixWorld[0];
	}

	updateResources(model)  {
		for(let i=0; i<this.resources.length;  i++) {
			if(this.resources[i]) {
				this.element.remove(this.resources[i]);
				this.resources[i] = null;
			}
		}
		this.indexblock = 0;
		if(model.stats[Stats.WOOD])
			this.updateBlock(Stats.WOOD, model);

		if(model.stats[Stats.STONE])
			this.updateBlock(Stats.STONE, model);
	
		if(model.stats[Stats.MEAT])
			this.updateBlock(Stats.MEAT, model);
	}

	updateBlock(type, model) {
		let matrixWorld;
		let fullBlock = Math.floor(model.stats[type]/model.maxByBlock);
		const leadBlock = Math.floor(model.stats[type]%model.maxByBlock);
		while(fullBlock--) {
			this.resources[this.indexblock] = THREE.getMesh(obj[type][3], material);
			matrixWorld = this.resources[this.indexblock].matrixWorld.elements;
			matrixWorld[12] = blockPos[this.indexblock*2] + model.ax;
			matrixWorld[14] = blockPos[this.indexblock*2+1] + model.az;
			matrixWorld[13] = 0.5 + model.ay;
			this.element.add(this.resources[this.indexblock]);
			this.indexblock++;
		}

		if(leadBlock > 8) {
			this.resources[this.indexblock] = THREE.getMesh(obj[type][2], material);
		} else if (leadBlock > 4) {
			this.resources[this.indexblock] = THREE.getMesh(obj[type][1], material);
		} else if (leadBlock > 0) {
			this.resources[this.indexblock] = THREE.getMesh(obj[type][0], material);
		}

		matrixWorld = this.resources[this.indexblock].matrixWorld.elements;
		matrixWorld[12] = blockPos[this.indexblock*2] + model.ax;
		matrixWorld[14] = blockPos[this.indexblock*2+1] + model.az;
		matrixWorld[13] = 0.5 + model.ay;
		this.element.add(this.resources[this.indexblock]);
		this.indexblock++;
	}

};