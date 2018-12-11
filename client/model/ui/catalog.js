const ee = require('../../kernel/tools/eventemitter');

class Catalog {

    constructor(config) {
        this.list = ['Canal', 'Road', 'House', 'Market', 'ForestHut', 'Attic', 'Barrack', 'HunterHut', 'LeaderHut', 'Repository', 'StoneMine', 'RoadDirty', 'RoadStone'];
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
        switch (entityClass) {
            case 'Canal':
                ee.emit('draftCanal', { drafted: true });
                break;
            case 'Road':
                ee.emit('draftRoad', { drafted: true });
                break;
            default:
                ee.emit('draftEntity', { type: entityClass, drafted: true });
        }
    }

}

Catalog.ui = true;
module.exports = Catalog;
