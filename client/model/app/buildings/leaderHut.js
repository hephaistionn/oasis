const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');

class LeaderHut extends Building {

    constructor(config, ground) {
        super(config, ground);
    }
}

LeaderHut.removable = true;
LeaderHut.description = 'This building increase the enable places for your population';
LeaderHut.tileX = 1;
LeaderHut.tileZ = 1;
LeaderHut.walkable = 0;
LeaderHut.cost = {wood: 5};
LeaderHut.require = {inactive: 2};
LeaderHut.enabled = { population: 6};
LeaderHut.constuctDuration = 1000;
LeaderHut.instances = [];

module.exports = LeaderHut;