const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class StoneMine extends Building {

    constructor(config, ground) {
        super(config, ground);
        this.cycleDuration = 1000;
    }

    working() {
        const success = this.spawnCharacter('Stonecutter'); 
        this.started = !success; // désactive le cycle update()=>working()
    }

    repoFilter(rep) {
        return rep.level > 0;
    }
}

StoneMine.selectable = true;
StoneMine.removable = true;
StoneMine.levelMax = 2;
StoneMine.description = 'Increase the enable places for your population';
StoneMine.label = 'Mineur';
StoneMine.picture = '/pic/stoneHut.png';
StoneMine.display = [];
StoneMine.tileX = 1;
StoneMine.tileZ = 1;
StoneMine.walkable = 0;
StoneMine.cost = {[Stats.WOOD]: 5};
StoneMine.upgrade = [{},{[Stats.WOOD]: 5}];
StoneMine.require = {inactive: 5};
StoneMine.enabled = {wood: 5};
StoneMine.constuctDuration = 1000;
StoneMine.waterLevelNeeded = 0;
StoneMine.instances = [];

module.exports = StoneMine;