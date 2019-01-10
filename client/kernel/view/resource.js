const THREE = require('three');
const meshSelector = new THREE.BoxHelper(undefined, 0xffff00);
meshSelector.matrixAutoUpdate = false;

module.exports = class Resource {

    constructor(model, parent) {
        this.element = new THREE.Object3D();
        this.element.matrixAutoUpdate = false;
        this.initMesh(model);
        this.update(0, model);
        this.add(parent);
        this.boxSelector = null;
    }

    update(dt, model) {
        this.updateMesh(model);
        const matrixWorld = this.element.matrixWorld.elements;
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
        } else if (!this.meshFull.parent) {
            this.removeMesh(this.meshSoldout);
            this.addMesh(this.meshFull);
        }
        if (model.selected || this.boxSelector) {
            this.updateMeshSelector(model);
        }
    }

    updateMeshSelector(model) {
        if (model.selected && !this.boxSelector) {
            this.boxSelector = meshSelector;
            this.boxSelector.setFromObject(this.meshFull)
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
        mesh.geometry.dispose();
    }

    remove(parent) {
        parent.render.scene.remove(this.element);
    }

    add(parent) {
        if (parent)
            parent.render.scene.add(this.element);
    }
}
