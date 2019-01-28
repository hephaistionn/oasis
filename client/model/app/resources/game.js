const Resource = require('../../../kernel/model/resource');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Game extends Resource {

    constructor(config, ground) {
        super(config, ground);
        this.stats.set(Stats.MEAT, config.meat || 10000);
    }
}
Game.selectable = false;
Game.tileX = 1;
Game.tileZ = 1;
Game.walkable = 0;
Game.code = 251;
Game.resource = true;
Game.instances = [];
module.exports = Game;
