const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class ForestHut extends Building {

    constructor(config, ground) {
        super(config, ground);
        this.cycleDuration = 1000;
    }


    working() {
        this.started = false; // désactive le cycle update()=>working()
        this.spawnCharacter('Lumberjack');
    }

    repoFilter(rep) {
        return rep.level > 0;
    }
}

ForestHut.selectable = true;
ForestHut.removable = true;
ForestHut.levelMax = 2;
ForestHut.description = 'Increase the enable places for your population';
ForestHut.label = 'Bucheron';
ForestHut.picture = '/pic/forestHut.png';
ForestHut.display = [];
ForestHut.tileX = 1;
ForestHut.tileZ = 1;
ForestHut.cost = { [Stats.WOOD]: 5 };
ForestHut.upgrade = [{},{[Stats.WOOD]: 5}];
ForestHut.require = { inactive: 2 };
ForestHut.enabled = { stone: 2 };
ForestHut.walkable = 0;
ForestHut.constuctDuration = 1000;
ForestHut.waterLevelNeeded = 100;
ForestHut.instances = [];
module.exports = ForestHut;
