const THREE = require('three');

module.exports = class Light {

    constructor(model, parent) {

        this.element = new THREE.Object3D();
        this.element.userData.id = model.id;
        this.element.name = 'lights';

        this.ambient = new THREE.AmbientLight(0x555555);

        this.directionalLight = new THREE.DirectionalLight(model.directionalColor);
        this.directionalLight.matrixAutoUpdate = false;

        this.directionalLight.castShadow = true;
        this.directionalLight.shadow = new THREE.LightShadow(new THREE.OrthographicCamera(-10, 10, 10, -10, 1, 200));
        this.directionalLight.shadow.bias = 0.001;
        this.directionalLight.shadow.radius = 0.8;
        this.directionalLight.shadow.mapSize.width = 1024;
        this.directionalLight.shadow.mapSize.height = 1024;

        this.element.add(this.ambient);
        this.element.add(this.directionalLight);

        this.update(0, model);
        this.add(parent);
    }

    update(dt, model) {
        this.directionalLight.shadow.camera.zoom = model.zoom / 5;
        this.directionalLight.shadow.camera.updateProjectionMatrix();

        this.directionalLight.matrix.elements[12] = model.ax;
        this.directionalLight.matrix.elements[13] = model.ay;
        this.directionalLight.matrix.elements[14] = model.az;
        this.directionalLight.target.matrixWorld.elements[12] = model.ax - model.offsetX;
        this.directionalLight.target.matrixWorld.elements[13] = model.ay - model.offsetY;
        this.directionalLight.target.matrixWorld.elements[14] = model.az - model.offsetZ;
    }

    remove(parent) {
        parent.render.scene.remove(this.element);
    }

    add(parent) {
        parent.render.scene.add(this.element);
    }

};
