const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Bridge extends Building {

    constructor(config, ground) {
        super(config, ground);
    }
}

Bridge.removable = true;
Bridge.description = 'This building increase the enable places for your population';
Bridge.tileX = 1;
Bridge.tileZ = 1;
Bridge.walkable = 1;
Bridge.cost = {[Stats.WOOD]: 5};
Bridge.waterLevelNeeded = 255;
Bridge.constuctDuration = 1000;
Bridge.instances = [];

module.exports = Bridge;
