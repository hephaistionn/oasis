const ee = require('../../kernel/tools/eventemitter');

class Catalog {

    constructor(config, ENTITIES, store) {
        this.ENTITIES = ENTITIES;
        this.store = store;

        this.categories = [
            {
                label: 'Civil',
                displayed: false,
                list: [
                    { class: 'House', label: 'cabane', pic: '/pic/house.png' },
                    { class: 'LeaderHut', label: 'cabane du chef', pic: '/pic/house.png' },
                    { class: 'Market', label: 'marché', pic: '/pic/house.png' },
                ]
            },
            {
                label: 'Ressources',
                displayed: false,
                list: [
                    { class: 'ForestHut', label: 'Bucheron', pic: '/pic/house.png' },
                    { class: 'HunterHut', label: 'Chasseur', pic: '/pic/house.png' },
                    { class: 'StoneMine', label: 'Mineur', pic: '/pic/house.png' },
                ]
            },
            {
                label: 'Infrastructure',
                displayed: false,
                list: [
                    { class: 'Repository', label: 'Entrepot', pic: '/pic/house.png' },
                    { class: 'Attic', label: 'Grenier', pic: '/pic/house.png' },
                    { class: 'Bridge', label: 'Pont', pic: '/pic/house.png' },
                    { class: 'Road', label: 'Chemin', pic: '/pic/house.png' },
                    { class: 'Road2', label: 'Route', pic: '/pic/house.png' },
                    { class: 'Canal', label: 'Canal', pic: '/pic/house.png' },
                    { class: 'Remover', label: 'Effaceur', pic: '/pic/house.png' },
                ]
            },
            {
                label: 'Militaire',
                displayed: false,
                list: [
                    { class: 'Barrack', label: 'Caserne', pic: '/pic/house.png' },
                    { class: 'Tower', label: 'Tour', pic: '/pic/house.png' },
                    { class: 'Wall', label: 'Mur', pic: '/pic/house.png' },                    
                ]
            }
        ]

        this.displayed = false;
        this.updated = false;
        this._id = 4;
    }

    open() {
        this.displayed = true;
        this.updated = true;
    }

    openCategory(index) {
        this.categories[index].displayed = true;
        this.updated = true;
    }

    close() {
        this.displayed = false;
        this.categories[0].displayed = false;
        this.categories[1].displayed = false;
        this.categories[2].displayed = false;
        this.categories[3].displayed = false;
        this.updated = true;
    }

    select(item) {
        this.close();
        switch (item.class) {
            case 'Canal':
                ee.emit('draftCanal', { drafted: true });
                break;
            case 'Road':
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
                ee.emit('addEntity', { type: item.class, drafted: true });
        }
    }

}

Catalog.ui = true;
module.exports = Catalog;
