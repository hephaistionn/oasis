const THREE = require('three');

const colorBlue = 0x0000ff;
const colorRed = 0xff0000;
const meshSelector = new THREE.BoxHelper(undefined, 0xffff00);
meshSelector.matrixAutoUpdate = false;

class Building {

    constructor(model, parent) {
        this.element = new THREE.Object3D();
        this.element.matrixAutoUpdate = false;
        this.boxSelector = null;
        this.meshLevel = [];
        this.level = 99;
        this.add(parent);
        this.initMesh(model);
        this.update(0, model);
    }

    update(dt, model) {
        this.updateMesh(model);
        const matrixWorld = this.element.matrixWorld.elements;
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
            this.draft.material.color.setHex(model.undroppable ? colorRed : colorBlue);
            if (!this.draft.parent) {
                this.addMesh(this.draft);
            }
        } else {
            if (this.level !== model.level) {
                this.removeMesh(this.meshLevel[this.level])
                this.addMesh(this.meshLevel[model.level]);
                this.level = model.level;
            }
            if (model.selected || this.boxSelector) {
                this.updateMeshSelector(model);
            }
        }
    }

    updateMeshSelector(model) {
        if (model.selected && !this.boxSelector) {
            this.boxSelector = meshSelector;
            this.boxSelector.setFromObject(this.meshLevel[model.level]);
            this.element.add(this.boxSelector);
        } else if (!model.selected && this.boxSelector) {
            this.element.remove(this.boxSelector);
            this.boxSelector = null;
        }
    }

    addMesh(mesh) {
        this.element.add(mesh);
        mesh.matrixWorld = this.element.matrixWorld;
    }

    removeMesh(mesh) {
        this.element.remove(mesh);
        if (mesh) {
            mesh.geometry.dispose();
        }
    }

    remove(parent) {
        parent.render.scene.remove(this.element);
    }

    add(parent) {
        if (parent)
            parent.render.scene.add(this.element);
    }
}


module.exports = Building;
