const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');

class StoneMine extends Building {

    constructor(config) {
        super(config);
    }
}

StoneMine.selectable = true;
StoneMine.description = 'This building increase the enable places for your population';
StoneMine.tileX = 1;
StoneMine.tileZ = 1;
StoneMine.walkable = 0;
StoneMine.cost = {wood: 5};
StoneMine.require = {inactive: 5};
StoneMine.enabled = {wood: 5};
StoneMine.constuctDuration = 1000;
StoneMine.instances = [];

module.exports = StoneMine;