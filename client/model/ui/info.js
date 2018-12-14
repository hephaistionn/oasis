const ee = require('../../kernel/tools/eventemitter');

class Info {

    constructor(conf, entities) {
        this._id = Math.floor((1 + Math.random()) * 0x10000000000);
        this.entity = null;
        this.opened = false;
        this.entities = entities;
        this._open = this.open.bind(this);
        this._close = this.close.bind(this);
        ee.on('select', this._open);
        ee.on('mouseClick', this._close);
        ee.on('mouseDownRight', this._close);
    }

    open(entityId) {
        const entity = this.entities.get(entityId);
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
        ee.off('select', this._open);
        ee.off('mouseClick', this._close);
        ee.off('mouseDownRight', this._close);
    }
}

Info.ui = true;
module.exports = Info;