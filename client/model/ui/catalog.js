const ee = require('../../kernel/tools/eventemitter');

class Catalog {

    constructor(config, ENTITIES, store) {
        this.ENTITIES = ENTITIES;
        this.store = store;
        this.currentCategory = 0;

        this.categories = [
            {
                label: 'Civil',
                list: [
                    ENTITIES['House'],
                    ENTITIES['LeaderHut'],
                    ENTITIES['Market'],
                    ENTITIES['Well']
                ]
            },
            {
                label: 'Ressources',
                list: [
                    ENTITIES['ForestHut'],
                    ENTITIES['HunterHut'],
                    ENTITIES['StoneMine'],
                ]
            },
            {
                label: 'Infrastructure',
                list: [
                    ENTITIES['Repository'],
                    ENTITIES['Attic'],
                    ENTITIES['Bridge'],
                    {name: 'Road1', label: 'chemin',  picture: '/pic/peon.png'},
                    {name: 'Road2', label: 'route',  picture: '/pic/peon.png'},
                    {name: 'Canal', label: 'canal',  picture: '/pic/peon.png'},
                    {name: 'Remover', label: 'effaceur',  picture: '/pic/peon.png'},
                ]
            },
            {
                label: 'Militaire',
                list: [
                    ENTITIES['Barrack'],
                    ENTITIES['Tower'],
                    {name: 'Wall', level:0, label: 'mur de bois',  picture: '/pic/peon.png'}
                ]
            }
        ];

        this._refresh = this.refresh.bind(this);
        this._close = this.close.bind(this);

        this.displayed = false;
        this.updated = false;
        this._id = 4;
    }

    open() {
        ee.emit('onOpenPanel');
        this.displayed = true;
        this.updated = true;
        ee.on('onUpdateStats', this._refresh);
        ee.on('onOpenPanel', this._close);
    }

    openCategory(index) {
        this.currentCategory = index;
        this.updated = true;
    }

    refresh(entity) {
        this.updated = true;
    }

    close() {
        ee.off('onUpdateStats', this._refresh);
        ee.off('onOpenPanel', this._close);
        this.displayed = false;
        this.updated = true;
    }

    select(item) {
        //this.close();
        switch (item.name) {
            case 'Canal':
                ee.emit('draftCanal', { drafted: true });
                break;
            case 'Road1':
                ee.emit('draftRoad', { drafted: true, type: 2 });
                break;
            case 'Road2':
                ee.emit('draftRoad', { drafted: true, type: 3 });
                break;
            case 'Wall':
                ee.emit('draftWall', { drafted: true });
                break;
            case 'Remover':
                ee.emit('remover');
                break;
            default:
                ee.emit('addEntity', { type: item.name, drafted: true });
        }
    }

}

Catalog.ui = true;
module.exports = Catalog;
