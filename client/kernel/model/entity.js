const ee = require('../tools/eventemitter');

class Entity {
    
    constructor(config) {
        this._id = config._id ? parseInt(config._id, 10) : Math.floor((1 + Math.random()) * 0x10000000000);
        this._parent = null;
        this._child = [];
        this.x = config.x || 0;
        this.z = config.z || 0;
        this.y = config.y || 0;
        this.roty = config.rot || 0;
        this.ax = this.x;
        this.ay = this.y;
        this.az = this.z;
        this.aroty = this.roty;
        this.updated = true;
    }

    move(x, y, z, roty) {
        this.updated = true;
        if (x !== undefined) this.x = x;
        if (y !== undefined) this.y = y;
        if (z !== undefined) this.z = z;
        if (roty !== undefined) this.roty = roty;

        this.ax = this._parent.ax + this.x * Math.cos(this._parent.aroty) - this.z * Math.sin(this._parent.aroty);
        this.ay = this._parent.ay + this.y;
        this.az = this._parent.az + this.x * Math.sin(this._parent.aroty) + this.z * Math.cos(this._parent.aroty);
        this.aroty = (this.roty + this._parent.aroty) % (Math.PI * 2);

        for (let i = 0; i < this._child.length; i++) {
            this._child[i].move()
        }

        this.onMove();
    }

    add(child) {
        if (this._child.indexOf(child) === -1) {
            this._child.push(child);
            child.onMount(this);
            child.move();
        }
        ee.emit('onNewEntity', child);
    }

    remove(child) {
        if (!child) return;
        const index = this._child.indexOf(child);
        this._child.splice(index, 1);
        child.onDismount();
        ee.emit('onRemoveEntity', child);
    }

    onMove() {

    }

    onMount(parent) {
        this._parent = parent;
    }

    onDismount() {
        this._child.forEach((children) => {
            this.remove(children);
        });
    }

}

Entity.entity = true;

module.exports = Entity;
