const THREE = require('three');

class Entity {

    constructor(model, parent) {
        this.element = new THREE.Object3D();
        this.initMesh(model);
        this.element.matrixAutoUpdate = false;
        this.update(0, model);
        this.add(parent);
        this.boxSelector = null;
        this.state = 0;
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
            this.draft.material.color.setHex(model.undroppable ? 0xff0000 : 0x0000ff);
            if (this.state !== 1) {
                this.addMesh(this.draft);
                this.state = 1;
            }
        } else if (model.level === 1) {
            if (this.state !== 2) {
                this.removeMesh(this.draft);
                this.removeMesh(this.foundation);
                this.addMesh(this.building);
                this.state = 2;
            }
            //TOUT REVOIR C'EST JUSTE DEGUEUX !!!!!
        } else if (model.level === 2) { 
            if (this.state !== 4) {
                this.removeMesh(this.building);
                this.addMesh(this.building2);
                this.state = 4;
            }
        } else {
            if (this.state !== 3) {
                this.removeMesh(this.draft);
                this.removeMesh(this.building);
                this.addMesh(this.foundation);
                this.state = 3;
            }
        }

        if (model.selected && !this.boxSelector) {
            this.boxSelector = new THREE.BoxHelper(this.building, 0xffff00);
            this.boxSelector.matrixAutoUpdate = false;
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


module.exports = Entity;
