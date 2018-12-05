const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');

class HunterHut extends Building {

    constructor(config) {
        super(config);
    }
}

HunterHut.selectable = true;
HunterHut.description = 'This building increase the enable places for your population';
HunterHut.tileX = 1;
HunterHut.tileZ = 1;
HunterHut.walkable = 0;
HunterHut.cost = {wood: 5};
HunterHut.require = {inactive: 2};
HunterHut.enabled = { population: 4};
HunterHut.constuctDuration = 1000;
HunterHut.instances = [];

module.exports = HunterHut;