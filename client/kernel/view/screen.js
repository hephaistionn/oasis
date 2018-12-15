const THREE = require('../tools/threejs');
const ee = require('../tools/eventemitter');
const COMPONENTS = {
    Light: require('../../view/app/light'),
    Ground: require('../../view/app/ground'),
    Camera: require('../../view/app/camera'),
    Render: require('../../view/app/render'),
    Berry: require('../../view/app/resources/berry'),
    Game: require('../../view/app/resources/game'),
    Stone: require('../../view/app/resources/stone'),
    Tree: require('../../view/app/resources/tree'),
    Catalog: require('../../view/ui/catalog'),
    Info: require('../../view/ui/info'),
    Stats: require('../../view/ui/stats'),
    Attic: require('../../view/app/building/attic'),
    Barrack: require('../../view/app/building/barrack'),
    House: require('../../view/app/building/house'),
    HunterHut: require('../../view/app/building/hunterHut'),
    LeaderHut: require('../../view/app/building/leaderHut'),
    Market: require('../../view/app/building/market'),
    Repository: require('../../view/app/building/repository'),
    StoneMine: require('../../view/app/building/stoneMine'),
    ForestHut: require('../../view/app/building/forestHut'),
    Builder: require('../../view/app/characters/builder'),
    Lumberjack: require('../../view/app/characters/lumberjack'),
    Road: require('../../view/app/road'),
    Canal: require('../../view/app/canal'),
    Remover: require('../../view/app/remover'),
};


const CAMERA = 1;
const GROUND = 2;

class Screen {

    constructor() {
        this.canvas = document.getElementById('D3');
        this.dom = document.getElementById('UI');
        this.container = document.getElementById('container');
        this.render = new COMPONENTS.Render(this.canvas);
        this.mousePress = false;
        this.mouse = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();
        this._px = null;
        this._pz = null;
        this._sx = null;
        this._sz = null;
        this._selecting = false;
        this.events = {};
        this._components = new Map();
        this.delayCount = 0;
    }

    mount(model) {
        this.update(0, model);
        this.initObservers();
    }

    dismount() {
        this.update(0);
        this.removeObservers();
    }

    hide(model) {
        const none = 'none';
        for (let i = 0; i < this.dom.childNodes.length; i++) {
            if (model._components.has(parseInt(this.dom.childNodes[i].id))) {
                this.dom.childNodes[i].style.display = none;
            }
        }
        this.removeObservers();
    }

    show(model) {
        const empty = '';
        for (let i = 0; i < this.dom.childNodes.length; i++) {
            if (model._components.has(parseInt(this.dom.childNodes[i].id))) {
                this.dom.childNodes[i].style.display = empty;
            }
        }
        this.initObservers();
    }

    update(dt, model) {
        if (!model) {
            const views = this._components;
            for (let id of views.keys()) {
                views.get(id).remove(this);
                views.delete(id);
            }
            return;
        }

        const models = model._components;
        const views = this._components;

        for (let id of models.keys()) {
            if (!views.has(id)) {
                views.set(id, new COMPONENTS[models.get(id).constructor.name](models.get(id), this));
            } else {
                if (models.get(id).updated) {
                    views.get(id).update(dt, models.get(id));
                    models.get(id).updated = false;
                }
                if (views.get(id).playAnimation) {
                    views.get(id).playAnimation(dt, models.get(id));
                }
            }
        }

        for (let id of views.keys()) {
            if (!models.has(id)) {
                views.get(id).remove(this);
                views.delete(id);
            }
        }

        this.delayCount += dt;
        this.delayCount = Math.min(500, this.delayCount);
        if (this.delayCount === 500)
            this.render.update();
    }

    _resize(e) {
        this.canvas.style = '';
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        this._components.get(CAMERA).resize(width, height);
        this.render.resize(width, height);
    }

    checkCollision(x, y) {
        if (!this._components.has(CAMERA)) return;
        this.mouse.x = (x / this.canvas.width) * 2 - 1;
        this.mouse.y = -(y / this.canvas.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this._components.get(CAMERA).element);
        const intersects = this.raycaster.intersectObjects(this.render.scene.children, true);
        if (intersects.length) {
            const point = intersects[0].point;
            const mesh = intersects[0].object;
            const id = mesh.name;
            if (id) {
                const event = {
                    x: point.x,
                    z: point.z,
                    data: mesh.userData
                };
                this._selecting = true;
                ee.emit('select', id);
                return true;
            }
        }
        return false;
    }

    initObservers() {
        this.events.__resize = this._resize.bind(this);
        window.addEventListener('resize', this.events.__resize, false);

        this.events.__mouseDown = this._mouseDown.bind(this);
        this.canvas.addEventListener('mousedown', this.events.__mouseDown);

        this.events.__mouseUp = this._mouseUp.bind(this);
        this.canvas.addEventListener('mouseup', this.events.__mouseUp);

        this.events.__mouseMove = this._mouseMove.bind(this);
        this.canvas.addEventListener('mousemove', this.events.__mouseMove);

        this.events.__mouseWheel = this._mouseWheel.bind(this);
        this.canvas.addEventListener('mousewheel', this.events.__mouseWheel);

        this.events.__mouseLeave = this._mouseLeave.bind(this);
        this.canvas.addEventListener('mouseleave', this.events.__mouseLeave);

        this.events.__mouseEnter = this._mouseEnter.bind(this);
        this.container.addEventListener('mouseenter', this.events.__mouseEnter);
    };

    removeObservers() {
        window.removeEventListener('resize', this.events.__resize);
        this.canvas.removeEventListener('mousedown', this.events.__mouseDown);
        this.canvas.removeEventListener('mouseup', this.events.__mouseUp);
        this.canvas.removeEventListener('mousemove', this.events.__mouseMove);
        this.canvas.removeEventListener('mousewheel', this.events.__mouseWheel);
        this.canvas.removeEventListener('mouseleave', this.events.__mouseLeave);
        this.canvas.removeEventListener('mouseenter', this.events.__mouseEnter);
    };

    _mouseDown(e) {
        if (e.which == 3) {
            ee.emit('mouseDownRight');
            return;
        }
        this._sx = e.offsetX;
        this._sz = e.offsetY;
        const point = this.getPointOnMap(e.offsetX, e.offsetY);
        if (!point) return;
        const relativePoint = this.getPointOnMapCameraRelative(point);
        this._px = relativePoint.x;
        this._pz = relativePoint.z;
        ee.emit('mouseDown', relativePoint.x, relativePoint.z, point.x, point.z);
        e.preventDefault();
    }

    _mouseUp(e) {
        //la souris ne bouge pas et ne vient de selectionner
        if (this._sx === e.offsetX && this._sz === e.offsetY) {
            if (!this.checkCollision(e.offsetX, e.offsetY)) {
                ee.emit('mouseClick', e.offsetX, e.offsetY);
            }
        } else {
            ee.emit('mouseUp', e.offsetX, e.offsetY);
        }
        this._px = null;
        this._pz = null;
        this._sx = null;
        this._sz = null;
        e.preventDefault();
    }

    _mouseMove(e) {
        if (e.buttons) {
            const point = this.getPointOnMap(e.offsetX, e.offsetY);
            if (!point) return;
            const relativePoint = this.getPointOnMapCameraRelative(point);
            ee.emit('mouseMovePress', (this._px - relativePoint.x), (this._pz - relativePoint.z), point.x, point.z);
        } else {
            const point = this.getPointOnMap(e.offsetX, e.offsetY);
            if (!point) return;
            ee.emit('mouseMove', point.x, point.y, point.z);
        }
        e.preventDefault();
    }

    getPointOnMapCameraRelative(point) {
        const camera = this._components.get(CAMERA);
        return {
            x: point.x - camera.element.matrixWorld.elements[12],
            z: point.z - camera.element.matrixWorld.elements[14]
        }
    }

    getPointOnMap(screenX, screenY, recursive) {
        if (!this._components.has(CAMERA)) return;
        this.mouse.x = (screenX / this.canvas.width) * 2 - 1;
        this.mouse.y = -(screenY / this.canvas.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this._components.get(CAMERA).element);
        let intersects = this.raycaster.intersectObjects(this._components.get(GROUND).clickableArea, recursive);
        if (intersects.length) {
            const point = intersects[0].point;
            const mesh = intersects[0].object;
            point.id = mesh.name;
            return point;
        }
    }

    _mouseWheel(e) {
        const delta = -Math.max(-2, Math.min(2, (e.wheelDelta || -e.detail)));
        ee.emit('mouseWheel', delta);
        e.preventDefault();
    };

    _mouseLeave() {

    }

    _mouseEnter() {

    }

}

module.exports = Screen;
