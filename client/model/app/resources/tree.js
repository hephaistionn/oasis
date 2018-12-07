const Resource = require('../../../kernel/model/resource');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Tree extends Resource {

    constructor(config, ground) {
        super(config, ground);
        this.stats.set(Stats.WOOD, config.wood || 10000);
    }

    getWorkerSlot() {
        const a = Math.random() * Math.PI * 2;
        const x = this.ax + Math.cos(a) * 1;
        const z = this.az + Math.sin(a) * 1;
        return { x: x, y: this.ay, z: z, rotY: a + Math.PI }
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
