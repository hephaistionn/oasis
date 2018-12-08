const THREE = require('three');

module.exports = class Road {

    constructor(model, parent) {
        this.element = new THREE.Object3D();
        this.add(parent);
    }


    remove(parent) {
        parent.render.scene.remove(this.element);
    }

    add(parent) {
        parent.render.scene.add(this.element);
    }
};
