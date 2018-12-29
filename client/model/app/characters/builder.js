const Character = require('../../../kernel/model/character');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Builder extends Character {
    constructor(params, ground) {
        super(params, ground);
        this.working = true;
        const entity = this.ground.getEntity(this.origin);
        this.workingDuration = entity.constructor.constuctDuration;
    }

    onEndWorking() {
        this.working = true;
        const entity = this.ground.getEntity(this.origin);
        entity.delivery();
        this.autoRemove();
    }
}

module.exports = Builder;