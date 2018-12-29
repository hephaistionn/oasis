const Character = require('../../../kernel/model/character');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Carrier extends Character {
    constructor(params, ground) {
        super(params, ground);
        this.targets.push({ entity: 'Tree', resource: Stats.WOOD });
        this.targets.push({ id: this.origin });
        this.targets.push({ entity: 'Stone', resource: Stats.STONE });
        this.targets.push({ id: this.origin });
        this.targets.push({ entity: 'Berry', resource: Stats.BERRY });
        this.targets.push({ id: this.origin });
    }

    onEndPath(entity) {

    }

    onStartPath(entity) {

    }
}

module.exports = Carrier;