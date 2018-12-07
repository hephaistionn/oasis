const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');

class Attic extends Building {

    constructor(config) {
        super(config);
    }
}

Attic.removable = true;
Attic.description = 'This building increase the enable places for your population';
Attic.tileX = 1;
Attic.tileZ = 1;
Attic.walkable = 0;
Attic.cost = { wood: 5 };
Attic.require = { inactive: 2 };
Attic.enabled = { population: 4 };
Attic.constuctDuration = 1000;
Attic.instances = [];

module.exports = Attic;
