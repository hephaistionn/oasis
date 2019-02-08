const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Attic extends Building {

    constructor(config, ground) {
        super(config, ground);
    }
}

Attic.selectable = true;
Attic.removable = true;
Attic.levelMax = 1;
Attic.description = 'This building increase the enable places for your population';
Attic.label = 'Grenier';
Attic.picture = '/pic/house.png';
Attic.tileX = 1;
Attic.tileZ = 1;
Attic.walkable = 0;
Attic.cost = {[Stats.WOOD]: 5};
Attic.require = { inactive: 2 };
Attic.enabled = { population: 4 };
Attic.waterLevelNeeded = 0;
Attic.constuctDuration = 1000;
Attic.instances = [];

module.exports = Attic;
