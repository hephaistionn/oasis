const ee = require('../../kernel/tools/eventemitter');
const Stats = require('../../kernel/model/stats');


class Info {

    constructor(conf, entities) {
        this._id = Math.floor((1 + Math.random()) * 0x10000000000);
        this.entity = null;
        this.opened = false;
        this.entities = entities;
        this._open = this.open.bind(this);
        this._close = this.close.bind(this);
        this._refresh = this.refresh.bind(this);
        ee.on('select', this._open);
        ee.on('mouseClick', this._close);
        ee.on('mouseDownRight', this._close);
    }

    open(entityId) {
        const entity = this.entities.get(entityId);
        this.entity = entity;
        this.opened = true;
        this.updated = true;
        ee.on('selectedUpdated', this._refresh);
    }

    refresh(entity) {
        console.log('refresh')
        this.updated = true;
    }

    close() {
        ee.off('selectedUpdated', this._refresh);
        this.opened = false;
        this.updated = true;
    }

    remove() {
        ee.emit('removeEntity', this.entity._id);
        this.entity = null;
        this.close();
    }

    upgrade() {
        this.entity.upgrade();  
        this.updated = true;
    }

    increaseAjut(index) {
        const types = Stats.materialTypes;
        let i = types.indexOf(this.entity.currentType[index]);
        i++;
        if(i>types.length-1) i = 0;
        this.entity.ajustResources(index,types[i]);
        this.updated = true;
    }

    descreaseAjut(index) {
        const types = Stats.materialTypes;
        let i = types.indexOf(this.entity.currentType[index]);
        i--;
        if(i<0) i = types.length-1;
        this.entity.ajustResources(index,types[i]);
        this.updated = true;
    }

    onDismount() {
        ee.off('select', this._open);
        ee.off('mouseClick', this._close);
        ee.off('mouseDownRight', this._close);
    }
}

Info.ui = true;
module.exports = Info;