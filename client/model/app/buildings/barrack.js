const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');

class Barrack extends Building {

    constructor(config) {
        super(config);
    }
}

Barrack.removable = true;
Barrack.description = 'This building increase the enable places for your population';
Barrack.tileX = 1;
Barrack.tileZ = 1;
Barrack.walkable = 0;
Barrack.cost = {wood: 5, stone: 2};
Barrack.require = {inactive: 2};
Barrack.enabled = { population: 6};
Barrack.constuctDuration = 1000;
Barrack.instances = [];

module.exports = Barrack;