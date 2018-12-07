const Resource = require('../../../kernel/model/resource');
const ee = require('../../../kernel/tools/eventemitter');

class Tree extends Resource {

    constructor(params, ground) {
        super(params, ground);
        this.wood = params.wood || 10000;
    }

    deductRessource(value) {
        this.updated = true;
        const quantity = Math.min(value, this.wood);
        this.wood -= value;
        return quantity;
    }

    getWorkerSlot() {
        const a = Math.random() * Math.PI * 2;
        const x = this.ax + Math.cos(a) * 0.35;
        const z = this.az + Math.sin(a) * 0.35;
        return {x: x, y: this.ay, z: z, a: a+Math.PI}
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
