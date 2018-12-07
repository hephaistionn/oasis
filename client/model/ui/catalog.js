const ee = require('../../kernel/tools/eventemitter');

class Catalog {

    constructor(config) {
        this.list = ['House','Market','ForestHut','Attic','Barrack','HunterHut','LeaderHut','Repository','StoneMine','RoadDirty','RoadStone'];
        this.displayed = false;
        this.updated = false;
        this._id = 4;
    }

    open() {
        this.displayed = true;
        this.updated = true;
    }

    close() {
        this.displayed = false;
        this.updated = true;
    }

    select(entityClass) {
        this.close();
        ee.emit('onDraftEntity', {type:entityClass, drafted: true});
    }

}

Catalog.ui = true;
module.exports = Catalog;
