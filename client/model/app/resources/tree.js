const Resource = require('../../../kernel/model/resource');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Tree extends Resource {

    constructor(config, ground) {
        super(config, ground);
        this.stats.set(Stats.WOOD, config.wood || 10000);
        this.num = config.num || Math.floor(Math.random()*3.99);
        this.aroty = config.a || Math.floor(Math.random() * 3.99) * Math.PI;
    }
    
}
Tree.selectable = false;
Tree.tileX = 1;
Tree.tileZ = 1;
Tree.walkable = 0;
Tree.code = 255; //value in alpha blue
Tree.resource = true;
Tree.instances = [];
Tree.description = 'This building increase the enable places for your population';
Tree.name = 'Arbre';
Tree.picture = '/pic/house.png';
module.exports = Tree;
