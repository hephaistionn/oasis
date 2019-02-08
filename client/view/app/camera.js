const THREE = require('three');

module.exports = class Camera {

    constructor(model, parent) {
        const canvas = document.getElementById('D3');
        //this.element = new THREE.PerspectiveCamera(25, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        this.element = new THREE.OrthographicCamera(-canvas.clientWidth / 15, canvas.clientWidth / 15, canvas.clientHeight / 15, -canvas.clientHeight / 15, 0.1, 1000);
        this.element.userData.id = model.id;
        this.target = new THREE.Vector3();
        this.update(0, model);
        this.add(parent);
    }

    update(dt, model) {
        this.element.position.x = model.ax;
        this.element.position.y = model.ay;
        this.element.position.z = model.az;
        this.target.x = model.targetX;
        this.target.y = model.targetY;
        this.target.z = model.targetZ;
        this.element.zoom = model.zoom;
        this.element.updateProjectionMatrix();
        this.element.lookAt(this.target);
    }

    resize(width, height) {
        //this.element.aspect = width / height;
        this.element.left = -width / 15;
        this.element.right = width / 15;
        this.element.top = height / 15;
        this.element.bottom = -height / 15;
        this.element.updateProjectionMatrix();
    }

    remove() {
        this.parent.camera = null;
        this.parent = null;
    }

    add(parent) {
        parent.camera = this.element;
        this.parent = parent;
    }
};
