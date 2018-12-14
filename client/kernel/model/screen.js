const ee = require('../tools/eventemitter');

module.exports = class Screen {

    constructor() {
        this._components = new Map();
        this._adding = this.adding.bind(this);
        this._removing = this.removing.bind(this);
        ee.on('onNewEntity', this._adding);
        ee.on('onRemoveEntity', this._removing);
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
        if(component.start) {
            component.start();
        }
    }

    remove(component) {
        if(component) {
            ee.emit('onRemoveEntity', component);
            if (component.onDismount) {
                component.onDismount();
            }
        }
    }

    removing(component) {
        this._components.delete(component._id);
    }

    get(id) {
        return this._components.get(id);
    }

    updateScreen(dt) {
        // this.update(dt);
        const components = this._components;
        for (let id of components.keys()) {
            if (components.get(id).started) {
                components.get(id).update(dt);
            }
        }
    }

    dismount() {
        ee.off('onNewEntity', this._adding);
        ee.off('onRemoveEntity', this._removing);
        if(this.onDismount) {
            this.onDismount();
        }
    }

}
