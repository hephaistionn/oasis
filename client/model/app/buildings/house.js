const Building = require('../../../kernel/model/building');
const Stats = require('../../../kernel/model/stats');
const ee = require('../../../kernel/tools/eventemitter');

class House extends Building {

    constructor(config, ground) {
        super(config, ground);
        this.cycleDuration = 4000;
    }

    working() {
        this.spawnCharacter('Carrier');
    }

}

House.removable = true;
House.description = 'This building increase the enable places for your population';
House.tileX = 1;
House.tileZ = 1;
House.walkable = 0;
House.cost = {[Stats.WOOD]: 5};
House.require = {};
House.enabled = {};
House.constuctDuration = 1000;
House.waterLevelNeeded = 40;
House.instances = [];

module.exports = House;