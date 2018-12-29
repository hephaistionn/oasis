const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Repository extends Building {

    constructor(config, ground) {
        super(config, ground);
    }

}

Repository.removable = true;
Repository.description = 'This building increase the enable places for your population';
Repository.tileX = 1;
Repository.tileZ = 1;
Repository.walkable = 0;
Repository.cost = {[Stats.WOOD]: 5};
Repository.require = { inactive: 2 };
Repository.enabled = { wood: 5 };
Repository.displayed = ['wood', 'stone'];
Repository.constuctDuration = 1000;
Repository.waterLevelNeeded = 0;
Repository.instances = [];

module.exports = Repository;