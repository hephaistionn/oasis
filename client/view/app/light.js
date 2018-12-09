const THREE = require('three');

module.exports = class Light {

    constructor(model, parent) {

        this.element = new THREE.Object3D();
        this.element.userData.id = model.id;
        this.element.name = 'lights';

        this.ambient = new THREE.AmbientLight(0x333333);

        this.directionalLight = new THREE.DirectionalLight(model.directionalColor);
        this.directionalLight.matrixAutoUpdate = false;
        if (model.shadow) {
            this.directionalLight.castShadow = true;
            this.directionalLight.shadow = new THREE.LightShadow(new THREE.OrthographicCamera(-20, 20, 20, -20, 0.1, 800));
            this.directionalLight.shadow.bias = 0.1;
            this.directionalLight.shadow.mapSize.width = 512 * 2;
            this.directionalLight.shadow.mapSize.height = 512 * 2;
        }

        this.element.add(this.ambient);
        this.element.add(this.directionalLight);

        this.update(0, model);
        this.add(parent);
    }

    update(dt, model) {
        //this.directionalLight.shadow.camera.zoom = model.zoom / 5;
        //this.directionalLight.shadow.camera.updateProjectionMatrix();
        //this.directionalLight.position.set(model.ax, model.ay, model.az);
        //this.directionalLight.target.position.set(0, 0, 0);
        this.directionalLight.matrix.elements[12] = model.ax;
        this.directionalLight.matrix.elements[13] = model.ay;
        this.directionalLight.matrix.elements[14] = model.az;
        this.directionalLight.target.matrixWorld.elements[12] = model.targetX;
        this.directionalLight.target.matrixWorld.elements[13] = model.targetY;
        this.directionalLight.target.matrixWorld.elements[14] = model.targetZ;
    }

    remove(parent) {
        parent.render.scene.remove(this.element);
    }

    add(parent) {
        parent.render.scene.add(this.element);
    }

};
