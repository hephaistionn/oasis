const Resource = require('../../../kernel/model/resource');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Game extends Resource {

    constructor(config, ground) {
        super(config, ground);
        this.stone = 100;
    }
}
Game.selectable = false;
Game.tileX = 1;
Game.tileZ = 1;
Game.walkable = 0;
//Game.code = 253;
Game.resource = true;
Game.instances = [];
module.exports = Game;
