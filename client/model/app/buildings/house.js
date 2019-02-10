const Building = require('../../../kernel/model/building');
const Stats = require('../../../kernel/model/stats');
const ee = require('../../../kernel/tools/eventemitter');

class House extends Building {

    constructor(config, ground) {
        super(config, ground);
        this.stats.set(Stats.POP, 2);
        this.cycleDuration = 4000;
        ee.emit('onUpdateStats');
    }

    working() {
        //this.spawnCharacter('Carrier');
    }

}

House.selectable = true;
House.removable = true;
House.levelMax = 3;
House.description = 'This building increase the enable places for your population';
House.label = 'Hutte Basique';
House.picture = '/pic/house.png';
House.display = [Stats.POP];
House.tileX = 1;
House.tileZ = 1;
House.walkable = 0;
House.cost = {[Stats.WOOD]: 5};
House.require = {};
House.enabled = {};
House.constuctDuration = 1000;
House.waterLevelNeeded = 40;
House.instances = [];
House.upgrade = [{},{[Stats.WOOD]: 5}, {[Stats.WOOD]: 5}];

module.exports = House;