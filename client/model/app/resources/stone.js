const Resource = require('../../../kernel/model/resource');
const ee = require('../../../kernel/tools/eventemitter');

class Stone extends Resource {

    constructor(params) {
        super(params);
        this.stone = 100;
    }
}
Stone.selectable = false;
Stone.tileX = 1;
Stone.tileZ = 1;
Stone.walkable = 0;
Stone.code = 253;
Stone.resource = true;
Stone.instances = [];
module.exports = Stone;
