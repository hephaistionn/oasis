const Resource = require('../../../kernel/model/resource');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Tree extends Resource {

    constructor(config, ground) {
        super(config, ground);
        this.stats.set(Stats.WOOD, config.wood || 10000);
    }
    
}
Tree.selectable = false;
Tree.tileX = 1;
Tree.tileZ = 1;
Tree.walkable = 0;
Tree.code = 255; //value in alpha blue
Tree.resource = true;
Tree.instances = [];
module.exports = Tree;
