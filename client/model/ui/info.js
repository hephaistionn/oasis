const ee = require('../../kernel/tools/eventemitter');

class Info {

    constructor(conf) {
        this._id = Math.floor((1 + Math.random()) * 0x10000000000);
        this.entity = null;
        this.opened = false;
        ee.on('select', this.open.bind(this));
        ee.on('mouseClick', this.close.bind(this));
        ee.on('mouseDownRight', this.close.bind(this));
    }

    open(entity) {
        this.entity = entity;
        this.opened = true;
        this.refresh(entity);
    }

    refresh(entity) {
        this.updated = true;
    }

    close() {
        this.opened = false;
        this.updated = true;
    }

    remove() {
        ee.emit('removeEntity', this.entity._id);
        this.entity = null;
        this.close();
    }

    onDismount() {
        ee.off('select', this.open.bind(this));
        ee.off('mouseClick', this.close.bind(this));
        ee.off('mouseDownRight', this.close.bind(this));
    }
}

Info.ui = true;
module.exports = Info;