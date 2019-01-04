const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Tower extends Building {

    constructor(config, ground) {
        super(config, ground);
    }
}

Tower.removable = true;
Tower.description = 'This building increase the enable places for your population';
Tower.tileX = 1;
Tower.tileZ = 1;
Tower.walkable = 0;
Tower.cost = {[Stats.WOOD]: 5};
Tower.require = { inactive: 2 };
Tower.enabled = { population: 4 };
Tower.waterLevelNeeded = 0;
Tower.constuctDuration = 1000;
Tower.instances = [];

module.exports = Tower;
