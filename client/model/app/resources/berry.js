const Resource = require('../../../kernel/model/resource');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Berry extends Resource {

    constructor(config, ground) {
        super(config, ground);
        this.stats.set(Stats.BERRY, config.berry || 100);
    }
}
Berry.selectable = false;
Berry.tileX = 1;
Berry.tileZ = 1;
Berry.walkable = 0;
Berry.code = 251;
Berry.resource = true;
Berry.instances = [];
Berry.description = 'This building increase the enable places for your population';
Berry.name = 'Baies';
Berry.picture = '/pic/house.png';
module.exports = Berry;
