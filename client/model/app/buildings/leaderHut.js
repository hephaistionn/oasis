const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class LeaderHut extends Building {

    constructor(config, ground) {
        super(config, ground);
    }
}

LeaderHut.selectable = true;
LeaderHut.removable = true;
LeaderHut.levelMax = 1;
LeaderHut.description = 'Augmente la population limite';
LeaderHut.label = 'Hutte Alpha';
LeaderHut.picture = '/pic/house.png';
LeaderHut.display = [];
LeaderHut.tileX = 1;
LeaderHut.tileZ = 1;
LeaderHut.walkable = 0;
LeaderHut.cost = {[Stats.WOOD]: 5, [Stats.STONE]: 5};
LeaderHut.require = {inactive: 2};
LeaderHut.enabled = { population: 6};
LeaderHut.constuctDuration = 1000;
LeaderHut.waterLevelNeeded = 40;
LeaderHut.instances = [];

module.exports = LeaderHut;