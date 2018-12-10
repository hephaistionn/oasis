const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');

class Market extends Building {

    constructor(config, ground) {
        super(config, ground);
    }

}

Market.removable = true;
Market.description = 'This building increase the prosperity of your city';
Market.tileX = 1;
Market.tileZ = 1;
Market.cost = {wood: 5, stone: 5};
Market.require = {inactive: 2};
Market.enabled = {wood: 5, population: 4};
Market.walkable = 0;
Market.constuctDuration = 1000;
Market.waterLevelNeeded = 40;
Market.instances = [];
module.exports = Market;
