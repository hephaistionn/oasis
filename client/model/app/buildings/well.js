const Building = require('../../../kernel/model/building');
const Stats = require('../../../kernel/model/stats');
const ee = require('../../../kernel/tools/eventemitter');

class Well extends Building {

    constructor(config, ground) {
        super(config, ground);
    }
}

Well.selectable = true;
Well.removable = true;
Well.levelMax = 3;
Well.description = 'Distribution de l\'eau';
Well.label = 'Puits';
Well.picture = '/pic/well.png';
Well.display = [];
Well.tileX = 1;
Well.tileZ = 1;
Well.walkable = 0;
Well.cost = {[Stats.WOOD]: 5};
Well.require = {};
Well.enabled = {};
Well.constuctDuration = 1000;
Well.waterLevelNeeded = 40;
Well.instances = [];
Well.upgrade = [{},{[Stats.WOOD]: 5}, {[Stats.WOOD]: 5}];

module.exports = Well;