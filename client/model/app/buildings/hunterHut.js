const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class HunterHut extends Building {

    constructor(config, ground) {
        super(config, ground);
        this.cycleDuration = 0;
    }

    onStart() {
        this.spawnCharacter('Hunter');
    }

    working() {
        this.spawnCharacter('Hunter');
    }
}

HunterHut.removable = true;
HunterHut.description = 'This building increase the enable places for your population';
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