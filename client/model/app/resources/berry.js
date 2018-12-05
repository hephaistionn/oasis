const Resource = require('../../../kernel/model/resource');
const ee = require('../../../kernel/tools/eventemitter');

class Berry extends Resource {

    constructor(params) {
        super(params);
        this.berry = 100;
    }
}
Berry.selectable = false;
Berry.tileX = 1;
Berry.tileZ = 1;
Berry.walkable = 0;
Berry.code = 251;
Berry.resource = true;
Berry.instances = [];
module.exports = Berry;
