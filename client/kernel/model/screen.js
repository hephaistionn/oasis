const ee = require('../tools/eventemitter');

module.exports = class Screen {

    constructor() {
        this._components = new Map();
        ee.on('onNewEntity', this.adding.bind(this));
        ee.on('onRemoveEntity', this.removing.bind(this));
        this.ax = 0;
        this.ay = 0;
        this.az = 0;
        this.aroty = 0;
    }

    add(component) {
        if (component.onMount && !component._parent) {
            component.onMount(this);
        }
        ee.emit('onNewEntity', component);
    }

    adding(component) {
        if (component._id === undefined) {
            throw 'component must have id !';
        }
        this._components.set(component._id, component);
    }

    remove(component) {
        ee.emit('onRemoveEntity', component);
        if (component.onDismount) {
            component.onDismount();
        }
    }

    removing(component) {
        this._components.delete(component._id);
    }

    get(id) {
        return this._components.get(id);
    }

    updateScreen(dt) {
        this.update(dt);
        const components = this._components;
        for (let id of components.keys()) {
            if (components.get(id).update) {
                components.get(id).update(dt);
            }
        }
    }

    dismount() {
        ee.off('onNewEntity', this.adding.bind(this));
        ee.off('onRemoveEntity', this.removing.bind(this));
    }

}
