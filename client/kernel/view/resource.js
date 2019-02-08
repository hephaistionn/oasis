const THREE = require('three');
const meshSelector = require('./boxSelector').meshSelector;

module.exports = class Resource {

    constructor(model, parent) {
        this.matrixWorld = null;
        this.boxSelector = null;
        this.currentMesh = null;
        this.add(parent);
        this.initMesh(model);
        this.update(0, model);
    }

    update(dt, model) {
        this.updateMesh(model);
        const matrixWorld = this.matrixWorld.elements;
        matrixWorld[12] = model.ax;
        matrixWorld[13] = model.ay;
        matrixWorld[14] = model.az;
        matrixWorld[0] = Math.cos(model.aroty);
        matrixWorld[2] = Math.sin(model.aroty);
        matrixWorld[8] = -matrixWorld[2];
        matrixWorld[10] = matrixWorld[0];
    }

    updateMesh(model) {
        if (model.soldout && !this.meshSoldout.parent) {
            this.removeMesh(this.meshFull);
            this.addMesh(this.meshSoldout);
            this.currentMesh = this.meshSoldout;
        } else if (!this.meshFull.parent) {
            this.removeMesh(this.meshSoldout);
            this.addMesh(this.meshFull);
            this.currentMesh = this.meshFull;
        }
        if (model.selected || this.boxSelector) {
            this.updateMeshSelector(model);
        }
    }

    updateMeshSelector(model) {
        if (model.selected && !this.boxSelector) {
            this.boxSelector = meshSelector;
            const Class = model.constructor;
            const size = model.ground.tileSize / 2;
            this.boxSelector.box.setFromArray([Class.tileX * size, size * 2, Class.tileZ * size, -Class.tileX * size, 0, -Class.tileZ * size]);
            this.currentMesh.add(this.boxSelector);
            this.boxSelector.updateMatrixWorld();
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
        this.parent.remove(mesh);
        mesh.geometry.dispose();
    }

    remove() {
        this.removeMesh(this.meshSoldout);
        this.removeMesh(this.meshFull);
        this.parent = null;
    }

    add(parent) {
        this.parent = parent;
    }
}
