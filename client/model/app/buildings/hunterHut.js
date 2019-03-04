const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class HunterHut extends Building {

    constructor(config, ground) {
        super(config, ground);
        this.cycleDuration = 1000;
    }

    working() {
        const success = this.spawnCharacter('Hunter'); 
        this.started = !success; // désactive le cycle update()=>working()
    }
}

HunterHut.selectable = true;
HunterHut.removable = true;
HunterHut.levelMax = 1;
HunterHut.description = 'Increase the enable places for your population';
HunterHut.label = 'Chasseur';
HunterHut.picture = '/pic/hunterHut.png';
HunterHut.display = [];
HunterHut.tileX = 1;
HunterHut.tileZ = 1;
HunterHut.walkable = 0;
HunterHut.cost = {[Stats.WOOD]: 5};
HunterHut.require = {inactive: 2};
HunterHut.enabled = { population: 4};
HunterHut.constuctDuration = 1000;
HunterHut.waterLevelNeeded = 0;
HunterHut.instances = [];

module.exports = HunterHut;