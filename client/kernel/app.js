const ee = require('../kernel/tools/eventemitter');
const Screen = require('../kernel/view/screen');
require('./tools/math');

class App {

    constructor() {

        this.models = {};
        this.model = null;
        this.modelInstances = {};
        this.viewInstances = {};
        this.params = {};
        this.currentScreenId = null;
        this.requestAnimation = null;

        for(let i = 0; i < arguments.length; i++) {
            this.models[arguments[i].name] = arguments[i];
        }

        ee.on('mouseDown', this.onMouseDown.bind(this));
        ee.on('mouseDownRight', this.onMouseDownRight.bind(this));
        ee.on('mouseMovePress', this.onMouseMovePress.bind(this));
        ee.on('mouseMove', this.onMouseMove.bind(this));
        ee.on('mouseBorder', this.onMouseBorder.bind(this));
        ee.on('mouseClick', this.onMouseClick.bind(this));
        ee.on('mouseUp', this.onMouseUp.bind(this));
        ee.on('keypress', this.onKeypress.bind(this));
        ee.on('mouseLeave', this.onMouseLeave.bind(this));
        ee.on('mouseEnter', this.onMouseEnter.bind(this));
        ee.on('mouseWheel', this.onMouseWheel.bind(this));
        ee.on('mouseMoveOnMap', this.onMouseMoveOnMap.bind(this));
        ee.on('mouseMoveOnMapPress', this.onMouseMoveOnMapPress.bind(this));
        ee.on('mouseDownOnMap', this.onMouseDownOnMap.bind(this));
        ee.on('mouseRotate', this.onMouseRotate.bind(this));
        
        ee.on('select', this.onSelect.bind(this));
        ee.on('draftEntity', this.onDraftEntity.bind(this));
        ee.on('draftRoad', this.onDraftRoad.bind(this));
        ee.on('addEntity', this.addEntity.bind(this));
        ee.on('removeEntity', this.removeEntity.bind(this))
        
        ee.on('touchStart', this.onTouchStart.bind(this));
        ee.on('touchEnd', this.onTouchEnd.bind(this));
        ee.on('touchCancel', this.onTouchCancel.bind(this));
        ee.on('touchleave', this.onTouchleave.bind(this));
        ee.on('touchMove', this.onTouchMove.bind(this));
        ee.on('touchMoveOnMap', this.onTouchMoveOnMap.bind(this));
        ee.on('touchStartOnMap', this.onTouchStartOnMap.bind(this));
        ee.on('touchDragg', this.onTouchDragg.bind(this));

        window.addEventListener('beforeunload', this.exit.bind(this));
        document.addEventListener('contextmenu', event => event.preventDefault());
    }

    closeScreen(id) {
        this._stop();
        this.viewInstances[id].dismount();
        this.modelInstances[id].dismount();
        delete this.modelInstances[id];
        delete this.viewInstances[id];
        delete this.params[id];
        this.model = null;
        this.view = null;
        this.currentScreenId = null;
    }

    openScreen(id, params) {
        this._stop();
        if(this.currentScreenId) {
            this.closeScreen(this.currentScreenId)
        }
        this.createScreen(id, params, this._start.bind(this));
        this.currentScreenId = id;
    }

    getCurrentScreen() {
        return this.model;
    }

    getCurrentScreenId() {
        return this.currentScreenId;
    }

    exit() {
        ee.emit('exit');
    }

    createScreen(id, params, cb) {
        this.modelInstances[id] = new this.models[id]();
        this.params[id] = params;
        this.viewInstances[id] = new Screen(params);
        this.model = this.modelInstances[id];
        this.model.initComponents(params)
        if(this.model.beforeShow)
            this.model.beforeShow(params);
        this.view = this.viewInstances[id];
        this.view.mount(this.model);
        cb();
    }

    _start() {
        const that = this;
        let time;
        var update = function update() {
            that.requestAnimation = requestAnimationFrame(update);
            const now = new Date().getTime();
            let dt = now - (time || now);
            time = now;
            dt = Math.min(dt, 100);
            that._update(dt);
        };

        update();
    }

    _stop() {
        cancelAnimationFrame(this.requestAnimation);
    }

    _update(dt) {
        this.model.updateScreen(dt);
        this.view.update(dt, this.model);
    }

    onMouseDown(xRelatif, zRelatif, x, z) {
        if(this.model.onMouseDown)
            this.model.onMouseDown(xRelatif, zRelatif, x, z);
    }


    onMouseDownRight(x, z) {
        if(this.model.onMouseDownRight)
            this.model.onMouseDownRight(x, z);
    }

    onMouseClick(x, z, id) {
        if(this.model.onMouseClick)
            this.model.onMouseClick(x, z, id);
    }

    onMouseUp(x, z) {
        if(this.model.onMouseUp)
            this.model.onMouseUp(x, z);
    }

    onKeypress(code) {
        if(this.model.onKeypress)
            this.model.onKeypress(code);
    }

    onMouseLeave(dx, dy) {
        if(this.model.onMouseLeave)
            this.model.onMouseLeave(dx, dy);
    }

    onMouseEnter(dx, dy) {
        if(this.model.onMouseEnter)
            this.model.onMouseEnter(dx, dy);
    }

    onMouseRotate() {
        if(this.model.onMouseRotate)
            this.model.onMouseRotate();
    }

    onMouseMovePress(xRelatif, zRelatif, x, z) {
        if(this.model.onMouseMovePress)
            this.model.onMouseMovePress(xRelatif, zRelatif, x, z);
    }

    onMouseMove(x, y, z) {
        if(this.model.onMouseMove)
            this.model.onMouseMove(x, y, z);
    }

    onMouseBorder(x, z) {
        if(this.model.onMouseBorder)
            this.model.onMouseBorder(x, z);
    }

    onMouseWheel(delta) {
        if(this.model.onMouseWheel)
            this.model.onMouseWheel(delta);
    }

    onMouseMoveOnMap(x, z) {
        if(this.model.onMouseMoveOnMap)
            this.model.onMouseMoveOnMap(x, z);
    }

    onMouseMoveOnMapPress(x, z) {
        if(this.model.onMouseMoveOnMapPress)
            this.model.onMouseMoveOnMapPress(x, z);
    }

    onMouseDownOnMap(x, z) {
        if(this.model.onMouseDownOnMap)
            this.model.onMouseDownOnMap(x, z);
    }

    onRemoveEntity(entityId) {
        if(this.model.onRemoveEntity)
            this.model.onRemoveEntity(entityId);
    }

    getEntity(entityId, callback) {
        if(this.model.getEntity)
            this.model.getEntity(entityId, callback);
    }

    onTouchStart(x, y) {
        if(this.model.touchStart)
            this.model.touchStart(x, y);
    }

    onTouchEnd(x, y) {
        if(this.model.touchEnd)
            this.model.touchEnd(x, y);
    }

    onTouchCancel(x, y) {
        if(this.model.touchCancel)
            this.model.touchCancel(x, y);
    }

    onTouchleave(x, y) {
        if(this.model.touchleave)
            this.model.touchleave(x, y);
    }

    onTouchMove(x, y) {
        if(this.model.touchMove)
            this.model.touchMove(x, y);
    }

    onTouchMoveOnMap(x, y) {
        if(this.model.touchMoveOnMap)
            this.model.touchMoveOnMap(x, y);
    }

    onTouchDragg(x, y, screenX, screenY) {
        if(this.model.touchDragg)
            this.model.touchDragg(x, y, screenX, screenY);
    }

    onTouchStartOnMap(x, y, model) {
        if(this.model.touchStartOnMap)
            this.model.touchStartOnMap(x, y, model);
    }

    onSelect(id) {
        const entity = this.model.get(id);
        if(this.model.onSelect && entity && !entity.drafted) // drafted is business logic, should not be here :)
            this.model.onSelect(entity);
    }

    onDraftEntity(entityClass) {
        if(this.model.onDraftEntity)
            this.model.onDraftEntity(entityClass);
    }

    onDraftRoad(entityClass) { // Road is business logic, should not be here :)
        if(this.model.onDraftRoad)
            this.model.onDraftRoad(entityClass);
    }

    addEntity(config) {
        if(this.model.addEntity)
        this.model.addEntity(config);
    }

    removeEntity(id) {
        if(this.model.removeEntity)
        this.model.removeEntity(id);
    }

}

module.exports = App;
