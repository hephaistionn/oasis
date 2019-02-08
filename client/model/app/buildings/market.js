const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Market extends Building {

    constructor(config, ground) {
        super(config, ground);
    }

}

Market.selectable = true;
Market.removable = true;
Market.levelMax = 1;
Market.description = 'This building increase the enable places for your population';
Market.label = 'Marché';
Market.picture = '/pic/market.png';
Market.tileX = 1;
Market.tileZ = 1;
Market.cost = {[Stats.WOOD]: 5};
Market.require = {inactive: 2};
Market.enabled = {wood: 5, population: 4};
Market.walkable = 0;
Market.constuctDuration = 1000;
Market.waterLevelNeeded = 40;
Market.instances = [];
module.exports = Market;
