const THREE = require('three');

const colorBlue = 0x0000ff;
const colorRed = 0xff0000;
const materialA = require('../../view/app/material/materialA');
const meshSelector = require('./boxSelector').meshSelector;
const Stats = require('../model/stats');
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

const blockPos = [
	3,3, 1,3, -1,3, -3,3,
	3,1, 1,1, -1,1, -3,1,
	3,-1, 1,-1, -1,-1, -3,-1,
	1,-3, -1,-3, -3,-3
];

class Building {

    constructor(model, parent) {
        this.currentMesh = null;
        this.boxSelector = null;
        this.matrixWorld = null;
        this.meshLevel = [];
        this.indexblock = 0;
        this.materials = [];
        this.level = 99;
        this.add(parent);
        this.initMesh(model);
        this.update(0, model);
    }

    update(dt, model) {
        this.updateMesh(model);
        const matrixWorld = this.matrixWorld.elements;
        matrixWorld[12] = model.ax;
        matrixWorld[14] = model.az;
        matrixWorld[13] = model.ay;
        matrixWorld[0] = Math.cos(model.aroty);
        matrixWorld[2] = Math.sin(model.aroty);
        matrixWorld[8] = -matrixWorld[2];
        matrixWorld[10] = matrixWorld[0];
    }

    updateMesh(model) {
        if (model.drafted) {
            this.draft.material.uniforms.color.value.setHex(model.undroppable ? colorRed : colorBlue);
            if (!this.draft.parent) {
                this.addMesh(this.draft);
                this.currentMesh = this.draft;
            }
        } else {
            if (this.level !== model.level) {
                this.removeMesh(this.meshLevel[this.level])
                this.addMesh(this.meshLevel[model.level]);
                this.currentMesh = this.meshLevel[model.level];
                this.level = model.level;
            }
            if (model.selected || this.boxSelector) {
                this.updateMeshSelector(model);
            }
            if(model.level ===  0)  {
                this.removeMaterial();
                this.indexblock = 0;
                if(model.materials[Stats.WOOD])
                    this.updateMaterilas(Stats.WOOD, model);
        
                if(model.materials[Stats.STONE])
                    this.updateMaterilas(Stats.STONE, model);
            }
        }
    }

    removeMaterial() {
		for(let i=0; i<this.materials.length;  i++) {
			if(this.materials[i]) {
				this.currentMesh.remove(this.materials[i]);
				this.materials[i] = null;
			}
		}
    }

	updateMaterilas(type, model) {
		let matrixWorld;
		let fullBlock = Math.floor(model.materials[type]/15);
		const leadBlock = Math.floor(model.materials[type]%15);
		while(fullBlock--) {
			this.materials[this.indexblock] = THREE.getMesh(obj[type][3], materialA);
			matrixWorld = this.materials[this.indexblock].matrixWorld.elements;
			matrixWorld[12] = blockPos[this.indexblock*2] + model.ax;
			matrixWorld[14] = blockPos[this.indexblock*2+1] + model.az;
			matrixWorld[13] = 0.5 + model.ay;
			this.meshLevel[this.level].add(this.materials[this.indexblock]);
			this.indexblock++;
		}

		if(leadBlock > 8) {
			this.materials[this.indexblock] = THREE.getMesh(obj[type][2], materialA);
		} else if (leadBlock > 4) {
			this.materials[this.indexblock] = THREE.getMesh(obj[type][1], materialA);
		} else if (leadBlock > 0) {
			this.materials[this.indexblock] = THREE.getMesh(obj[type][0], materialA);
		}

		matrixWorld = this.materials[this.indexblock].matrixWorld.elements;
		matrixWorld[12] = blockPos[this.indexblock*2] + model.ax;
		matrixWorld[14] = blockPos[this.indexblock*2+1] + model.az;
		matrixWorld[13] = 0.5 + model.ay;
		this.meshLevel[this.level].add(this.materials[this.indexblock]);
		this.indexblock++;
	}

    updateMeshSelector(model) {
        if (model.selected && !this.boxSelector) {
            this.boxSelector = meshSelector;
            const Class = model.constructor;
            const size = model.ground.tileSize / 2;
            this.boxSelector.box.setFromArray([Class.tileX * size, size * 2, Class.tileZ * size, -Class.tileX * size, 0, -Class.tileZ * size]);
            this.boxSelector.updateMatrixWorld();
            this.currentMesh.add(this.boxSelector);
        } else if (!model.selected && this.boxSelector) {
            this.currentMesh.remove(this.boxSelector);
            this.boxSelector = null;
        }
    }

    addMesh(mesh) {
        this.parent.add(mesh);
        if(!this.matrixWorld) {
            this.matrixWorld = mesh.matrixWorld;
        } else {
            mesh.matrixWorld = this.matrixWorld;
        }   
    }

    removeMesh(mesh) {
        if(mesh) {
            this.parent.remove(mesh);
            mesh.geometry.dispose();
        }
    }

    remove() {
        this.removeMesh(this.currentMesh);
        this.parent = null;
    }

    add(parent) {
        this.parent = parent;
    }
}


module.exports = Building;
