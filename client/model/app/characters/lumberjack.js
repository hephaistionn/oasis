const Character = require('../../../kernel/model/character');
const ee = require('../../../kernel/tools/eventemitter');

class Lumberjack extends Character {

    constructor(params) {
        super(params);
        this.targets.push({entity:'Tree', resource: 'wood'});
        this.targets.push({});
    }

}

module.exports = Lumberjack;