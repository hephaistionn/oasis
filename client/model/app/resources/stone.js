const Resource = require('../../../kernel/model/resource');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

const STONE = 1;
class Stone extends Resource {

    constructor(config, ground) {
        super(config, ground);
        this.stats.set(Stats.STONE, config.stone || 10000);
    }
}
Stone.selectable = true;
Stone.tileX = 1;
Stone.tileZ = 1;
Stone.walkable = 0;
Stone.code = 253;
Stone.resource = true;
Stone.instances = [];
Stone.description = 'This building increase the enable places for your population';
Stone.label = 'Pierre';
Stone.picture = '/pic/stone.png';
module.exports = Stone;
