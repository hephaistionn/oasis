const Character = require('../../../kernel/model/character');
const ee = require('../../../kernel/tools/eventemitter');

class Lumberjack extends Character {

    constructor(params, ground) {
        super(params, ground);
        this.targets.push({entity: 'Tree', resource: 'wood'});
        this.targets.push({id  : this.origin});
    }

    onEndPath(entity) {
        debugger;
    }

    onStartPath(entity) {
        debugger;
    }

}

module.exports = Lumberjack;