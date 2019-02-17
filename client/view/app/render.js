const THREE = require('three');
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('D3'), antialias: true, alpha: true });
module.exports = class Scene {

    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = renderer;
        this.renderer.setClearColor(0xffffff, 0);
        //this.renderer.setClearColor(0x928684);
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.scene = new THREE.Scene();
        this.clicableMeshes = new THREE.Object3D();
        this.clicableMeshes.name = 'clicableMeshes';
        this.clicableMeshes.matrixAutoUpdate = false;
        this.scene.add(this.clicableMeshes);
        this.scene.matrixAutoUpdate = false;
    }

    update() {
        this.renderer.render(this.scene, this.scene.camera);
    }

    resize(width, height) {
        this.renderer.setSize(width, height);
    }

    dismount() {
        this.canvas.removeEventListener('resize', this._resize);
    }

    updateState(color) {
        this.renderer.setClearColor(color);
    }
};
