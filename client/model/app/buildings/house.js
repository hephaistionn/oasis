const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');

class House extends Building {

    constructor(config) {
        super(config);
        if(!this.drafted)
            this.spawnCharacter('Builder');
    }

}

House.removable = true;
House.description = 'This building increase the enable places for your population';
House.tileX = 1;
House.tileZ = 1;
House.walkable = 0;
House.cost = {wood: 20, stone: 1};
House.require = {};
House.enabled = {};
House.constuctDuration = 1000;
House.instances = [];

module.exports = House;
